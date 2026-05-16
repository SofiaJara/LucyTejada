import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import programRoutes from './routes/programas.js';
import groupRoutes from './routes/grupos.js';
import inscripcionRoutes from './routes/inscripciones.js';
import asistenciaRoutes from './routes/asistencia.js';
import evaluacionRoutes from './routes/evaluaciones.js';
import notificacionRoutes from './routes/notificaciones.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/programas', programRoutes);
app.use('/api/grupos', groupRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Backend Lucy Tejada corriendo en http://localhost:${PORT}`);
});
