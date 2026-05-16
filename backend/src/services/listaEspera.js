import prisma from '../prisma.js';

// Promueve estudiantes de lista de espera a "activo" cuando hay cupos libres.
// Devuelve la lista de inscripciones promovidas (con datos para notificar).
export async function promoverListaEspera(grupoId, { limite } = {}) {
  const grupo = await prisma.grupo.findUnique({
    where: { id: Number(grupoId) },
    include: {
      programa: true,
      _count: { select: { inscripciones: { where: { estado: 'activo' } } } },
    },
  });
  if (!grupo || !grupo.activo) return [];

  const cuposLibres = grupo.cupoMaximo - grupo._count.inscripciones;
  if (cuposLibres <= 0) return [];

  const aPromover = await prisma.inscripcion.findMany({
    where: { grupoId: grupo.id, estado: 'lista_espera' },
    orderBy: { fechaInscripcion: 'asc' },
    take: Math.min(cuposLibres, limite ?? cuposLibres),
    include: { estudiante: { select: { id: true, nombre: true, apellido: true, correo: true } } },
  });
  if (aPromover.length === 0) return [];

  await prisma.$transaction([
    ...aPromover.map(ins =>
      prisma.inscripcion.update({ where: { id: ins.id }, data: { estado: 'activo' } })
    ),
    ...aPromover.map(ins =>
      prisma.notificacion.create({
        data: {
          usuarioId: ins.estudianteId,
          titulo: `Cupo disponible · ${grupo.programa.nombre}`,
          mensaje: `Se liberó un cupo y fuiste promovido de la lista de espera al ${grupo.nombre} de ${grupo.programa.nombre}.`,
          categoria: 'academico',
        },
      })
    ),
  ]);

  return aPromover.map(ins => ({
    id: ins.id,
    estudianteId: ins.estudianteId,
    estudiante: `${ins.estudiante.nombre} ${ins.estudiante.apellido}`,
    correo: ins.estudiante.correo,
    programa: grupo.programa.nombre,
    grupo: grupo.nombre,
  }));
}
