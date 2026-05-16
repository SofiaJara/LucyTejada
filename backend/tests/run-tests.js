// Cross-platform test runner: sets test env vars, resets the test DB, runs node --test.
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');

const env = {
  ...process.env,
  DATABASE_URL: 'file:./test.db',
  JWT_SECRET: 'test-jwt-secret',
  NODE_ENV: 'test',
};

console.log('Reseteando base de datos de pruebas...');
const db = spawnSync(
  'npx',
  ['prisma', 'db', 'push', '--force-reset', '--skip-generate', '--accept-data-loss'],
  { stdio: 'inherit', shell: true, env, cwd: backendRoot }
);
if (db.status !== 0) process.exit(db.status);

const testFiles = readdirSync(__dirname)
  .filter(f => f.endsWith('.test.js'))
  .map(f => path.join('tests', f));

console.log(`Ejecutando ${testFiles.length} archivos de prueba...`);
const t = spawnSync(
  'node',
  ['--test', '--test-concurrency=1', ...testFiles],
  { stdio: 'inherit', shell: true, env, cwd: backendRoot }
);
process.exit(t.status ?? 1);
