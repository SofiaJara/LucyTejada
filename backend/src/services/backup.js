import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function listarBackups() {
  ensureBackupDir();
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db'))
    .map(f => {
      const stat = fs.statSync(path.join(BACKUP_DIR, f));
      return {
        archivo: f,
        tamanoBytes: stat.size,
        creadoEn: stat.birthtime || stat.mtime,
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
  return {
    archivo: path.basename(target),
    tamanoBytes: stat.size,
    creadoEn: stat.birthtime || stat.mtime,
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
