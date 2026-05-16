import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { app, resetDb, disconnect, seedBasic, login } from './helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.resolve(__dirname, '..', 'backups');

function limpiarBackups() {
  if (fs.existsSync(BACKUP_DIR)) {
    for (const f of fs.readdirSync(BACKUP_DIR)) {
      if (f.endsWith('.db')) fs.unlinkSync(path.join(BACKUP_DIR, f));
    }
  }
}

describe('backups (CAR-12)', () => {
  before(async () => { await resetDb(); limpiarBackups(); });
  after(async () => { await disconnect(); limpiarBackups(); });
  beforeEach(async () => { await resetDb(); limpiarBackups(); });

  test('POST /api/admin/backups requiere admin', async () => {
    const { profesor } = await seedBasic();
    const t = await login(profesor.correo, 'password123');
    const res = await request(app).post('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 403);
  });

  test('POST /api/admin/backups crea archivo y lo lista', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const create = await request(app).post('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    assert.equal(create.status, 201);
    assert.match(create.body.archivo, /\.db$/);
    assert.ok(create.body.tamanoBytes > 0);

    const list = await request(app).get('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    assert.equal(list.status, 200);
    assert.ok(list.body.some(b => b.archivo === create.body.archivo));

    const ruta = path.join(BACKUP_DIR, create.body.archivo);
    assert.ok(fs.existsSync(ruta), 'el archivo de backup debe existir físicamente');
  });

  test('GET /api/admin/backups/:archivo/descargar devuelve el binario', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const c = await request(app).post('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    const dl = await request(app).get(`/api/admin/backups/${c.body.archivo}/descargar`).set('Authorization', `Bearer ${t}`);
    assert.equal(dl.status, 200);
    assert.ok(dl.body.length > 0);
  });

  test('GET /api/admin/backups/<inexistente>/descargar responde 404', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const dl = await request(app).get('/api/admin/backups/no-existe.db/descargar').set('Authorization', `Bearer ${t}`);
    assert.equal(dl.status, 404);
  });

  test('rechaza path traversal en el nombre del archivo', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const dl = await request(app).get('/api/admin/backups/..%2Fdev.db/descargar').set('Authorization', `Bearer ${t}`);
    // path.basename limpia la barra; el archivo dev.db no existe en BACKUP_DIR
    assert.equal(dl.status, 404);
  });
});
