import prisma from '../prisma.js';

// Un estudiante está "en riesgo de deserción" si está activo, tiene
// inscripciones activas, su grupo ya dictó al menos 3 clases en los
// últimos 60 días y su asistencia ponderada es 0% o no se ha registrado.
// Se incluye también si lleva más de 30 días sin asistir a ninguna clase.
export async function calcularDesercion({ diasVentana = 60, minClases = 3, sinAsistirDias = 30 } = {}) {
  const ahora = Date.now();
  const desde = new Date(ahora - diasVentana * 24 * 3600 * 1000);
  const corteSinAsistir = new Date(ahora - sinAsistirDias * 24 * 3600 * 1000);

  const inscripciones = await prisma.inscripcion.findMany({
    where: {
      estado: 'activo',
      estudiante: { activo: true },
      grupo: { activo: true },
    },
    include: {
      estudiante: { select: { id: true, nombre: true, apellido: true, correo: true, documento: true } },
      grupo: {
        include: {
          programa: true,
          clases: {
            where: { fecha: { gte: desde } },
            include: { asistencias: true },
          },
        },
      },
    },
  });

  const enRiesgo = [];
  for (const ins of inscripciones) {
    const clases = ins.grupo.clases;
    if (clases.length < minClases) continue;

    let totalRegistros = 0, presentes = 0, ultimaPresencia = null;
    for (const c of clases) {
      const propio = c.asistencias.find(a => a.estudianteId === ins.estudianteId);
      if (propio) {
        totalRegistros++;
        if (propio.asistio) {
          presentes++;
          if (!ultimaPresencia || c.fecha > ultimaPresencia) ultimaPresencia = c.fecha;
        }
      }
    }

    const porcentaje = totalRegistros > 0 ? Math.round((presentes / totalRegistros) * 100) : 0;
    const noHaAsistidoHace = ultimaPresencia ? ultimaPresencia : null;
    const inactivoMuchoTiempo = !ultimaPresencia || ultimaPresencia < corteSinAsistir;

    if (porcentaje === 0 || (inactivoMuchoTiempo && porcentaje < 40)) {
      enRiesgo.push({
        inscripcionId: ins.id,
        estudianteId: ins.estudiante.id,
        estudiante: `${ins.estudiante.nombre} ${ins.estudiante.apellido}`,
        documento: ins.estudiante.documento,
        correo: ins.estudiante.correo,
        programa: ins.grupo.programa.nombre,
        grupo: ins.grupo.nombre,
        clasesEvaluadas: clases.length,
        asistencias: presentes,
        porcentajeAsistencia: porcentaje,
        ultimaAsistencia: noHaAsistidoHace,
      });
    }
  }
  return enRiesgo.sort((a, b) => a.porcentajeAsistencia - b.porcentajeAsistencia);
}
