import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import prisma from '../prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.resolve(__dirname, '..', '..', 'backups');

function resolveDbPath() {
  // DATABASE_URL es del estilo "file:./dev.db" relativo a prisma/
  const url = process.env.DATABASE_URL || 'file:./dev.db';
  const m = url.match(/^file:(.*)$/);
  if (!m) throw new Error(`DATABASE_URL no soportada para backup: ${url}`);
  const rel = m[1];
  return path.resolve(__dirname, '..', '..', 'prisma', rel);
}

export function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function sha256File(ruta) {
  const buf = fs.readFileSync(ruta);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function rutaHash(rutaBk) {
  return `${rutaBk}.sha256`;
}

export function listarBackups() {
  ensureBackupDir();
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db'))
    .map(f => {
      const ruta = path.join(BACKUP_DIR, f);
      const stat = fs.statSync(ruta);
      const sidecar = rutaHash(ruta);
      let hashEsperado = null;
      if (fs.existsSync(sidecar)) {
        hashEsperado = fs.readFileSync(sidecar, 'utf8').trim().split(/\s+/)[0];
      }
      const hashActual = sha256File(ruta);
      return {
        archivo: f,
        tamanoBytes: stat.size,
        creadoEn: stat.birthtime || stat.mtime,
        sha256: hashActual,
        integridad: hashEsperado ? (hashEsperado === hashActual ? 'ok' : 'alterado') : 'sin-hash',
      };
    })
    .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
}

export function crearBackup() {
  ensureBackupDir();
  const dbPath = resolveDbPath();
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Base de datos no encontrada en ${dbPath}`);
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(BACKUP_DIR, `lucy-${stamp}.db`);
  fs.copyFileSync(dbPath, target);
  const stat = fs.statSync(target);
  const sha256 = sha256File(target);
  fs.writeFileSync(rutaHash(target), `${sha256}  ${path.basename(target)}\n`, 'utf8');
  return {
    archivo: path.basename(target),
    tamanoBytes: stat.size,
    creadoEn: stat.birthtime || stat.mtime,
    sha256,
    integridad: 'ok',
  };
}

export function rutaBackup(nombre) {
  ensureBackupDir();
  const limpio = path.basename(nombre); // evita path traversal
  if (!limpio.endsWith('.db')) return null;
  const ruta = path.join(BACKUP_DIR, limpio);
  if (!fs.existsSync(ruta)) return null;
  return ruta;
}

export function eliminarBackup(nombre) {
  const ruta = rutaBackup(nombre);
  if (!ruta) throw new Error('Backup no encontrado');
  fs.unlinkSync(ruta);
  const sidecar = rutaHash(ruta);
  if (fs.existsSync(sidecar)) fs.unlinkSync(sidecar);
  return { eliminado: path.basename(ruta) };
}

export async function restaurarBackup(nombre) {
  const ruta = rutaBackup(nombre);
  if (!ruta) throw new Error('Backup no encontrado');

  // Verificar integridad antes de sobreescribir la BD
  const sidecar = rutaHash(ruta);
  if (fs.existsSync(sidecar)) {
    const esperado = fs.readFileSync(sidecar, 'utf8').trim().split(/\s+/)[0];
    const actual = sha256File(ruta);
    if (esperado !== actual) {
      throw new Error('El backup falló la verificación de integridad (sha256 no coincide).');
    }
  }

  const dbPath = resolveDbPath();
  // Snapshot pre-restauración para recuperar si algo falla
  const previa = `${dbPath}.pre-restore-${Date.now()}.bak`;
  if (fs.existsSync(dbPath)) fs.copyFileSync(dbPath, previa);

  // Desconectar Prisma para liberar el archivo en Windows
  try { await prisma.$disconnect(); } catch {}
  fs.copyFileSync(ruta, dbPath);

  return {
    restaurado: path.basename(ruta),
    backupPrevio: path.basename(previa),
  };
}
