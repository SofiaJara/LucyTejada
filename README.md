# Centro Cultural Lucy Tejada — Sistema de Gestión

Plataforma web para la gestión académica y administrativa del Centro Cultural Lucy Tejada, Pereira.

## Estructura

```
LucyTejada/
├── backend/        # API REST (Express + Prisma + SQLite + JWT)
└── frontend/       # Next.js 16 (App Router)
```

## Puesta en marcha

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run seed       # crea datos de ejemplo
npm run dev        # http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

## Credenciales de prueba

| Rol         | Correo                              | Contraseña      |
|-------------|-------------------------------------|-----------------|
| Admin       | admin@lucytejada.edu.co             | admin123        |
| Profesor    | hernan.vargas@lucytejada.edu.co     | profesor123     |
| Estudiante  | andres.lopez@correo.com             | estudiante123   |

## Funcionalidades

### Estudiante
- Ver perfil, programa, grupo, horario y docente
- Consultar inscripción y progreso académico
- Inscribirse en programas culturales con confirmación
- Consultar evaluaciones cualitativas
- Recibir notificaciones

### Profesor
- Dashboard con métricas (grupos, estudiantes, clases, notificaciones)
- Ver listado de estudiantes por grupo
- Registrar asistencia con observaciones por sesión
- Crear evaluaciones cualitativas por estudiante y período
- Recibir notificaciones

### Administrador
- Dashboard con métricas globales
- CRUD de usuarios (estudiantes, profesores, administradores)
- CRUD de programas culturales
- CRUD de grupos (con asignación de profesor y horario)
- Reportes de asistencia, inscripciones y demografía (export CSV)
- Envío masivo de notificaciones

## Tecnologías

- **Frontend:** Next.js 16, React 19, App Router
- **Backend:** Node.js, Express, Prisma ORM, SQLite, JWT, bcrypt
- **Estilo:** Diseño monocromo verde-cultural inline (sin frameworks de UI)
