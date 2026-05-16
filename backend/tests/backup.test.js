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
      if (f.endsWith('.db') || f.endsWith('.sha256')) fs.unlinkSync(path.join(BACKUP_DIR, f));
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

  test('crea sidecar .sha256 y reporta integridad ok', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const c = await request(app).post('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    assert.equal(c.status, 201);
    assert.match(c.body.sha256, /^[0-9a-f]{64}$/);
    assert.equal(c.body.integridad, 'ok');

    const sidecar = path.join(BACKUP_DIR, `${c.body.archivo}.sha256`);
    assert.ok(fs.existsSync(sidecar), 'debe existir el sidecar con el hash');

    const list = await request(app).get('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    const entry = list.body.find(b => b.archivo === c.body.archivo);
    assert.equal(entry.integridad, 'ok');
    assert.equal(entry.sha256, c.body.sha256);
  });

  test('detecta alteración del archivo de backup', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const c = await request(app).post('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    fs.appendFileSync(path.join(BACKUP_DIR, c.body.archivo), 'corrupcion');

    const list = await request(app).get('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    const entry = list.body.find(b => b.archivo === c.body.archivo);
    assert.equal(entry.integridad, 'alterado');
  });

  test('POST /api/admin/backups/:archivo/restaurar requiere admin y restaura', async () => {
    const { admin, profesor } = await seedBasic();
    const tAdmin = await login(admin.correo, 'password123');
    const tProf = await login(profesor.correo, 'password123');

    const c = await request(app).post('/api/admin/backups').set('Authorization', `Bearer ${tAdmin}`);
    const archivo = c.body.archivo;

    const denied = await request(app).post(`/api/admin/backups/${archivo}/restaurar`).set('Authorization', `Bearer ${tProf}`);
    assert.equal(denied.status, 403);

    const ok = await request(app).post(`/api/admin/backups/${archivo}/restaurar`).set('Authorization', `Bearer ${tAdmin}`);
    assert.equal(ok.status, 200);
    assert.equal(ok.body.restaurado, archivo);
    assert.match(ok.body.backupPrevio, /pre-restore-/);
  });

  test('DELETE /api/admin/backups/:archivo elimina backup y sidecar', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const c = await request(app).post('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    const archivo = c.body.archivo;
    const ruta = path.join(BACKUP_DIR, archivo);
    const sidecar = `${ruta}.sha256`;
    assert.ok(fs.existsSync(ruta));
    assert.ok(fs.existsSync(sidecar));

    const del = await request(app).delete(`/api/admin/backups/${archivo}`).set('Authorization', `Bearer ${t}`);
    assert.equal(del.status, 200);
    assert.equal(del.body.eliminado, archivo);
    assert.ok(!fs.existsSync(ruta), 'el .db debe haberse eliminado');
    assert.ok(!fs.existsSync(sidecar), 'el sidecar .sha256 debe haberse eliminado');

    const list = await request(app).get('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    assert.ok(!list.body.some(b => b.archivo === archivo));
  });

  test('DELETE /api/admin/backups/<inexistente> responde 404', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const del = await request(app).delete('/api/admin/backups/no-existe.db').set('Authorization', `Bearer ${t}`);
    assert.equal(del.status, 404);
  });

  test('DELETE /api/admin/backups requiere admin', async () => {
    const { admin, profesor } = await seedBasic();
    const tAdmin = await login(admin.correo, 'password123');
    const tProf = await login(profesor.correo, 'password123');
    const c = await request(app).post('/api/admin/backups').set('Authorization', `Bearer ${tAdmin}`);
    const denied = await request(app).delete(`/api/admin/backups/${c.body.archivo}`).set('Authorization', `Bearer ${tProf}`);
    assert.equal(denied.status, 403);
  });

  test('restaurar rechaza backup con integridad alterada', async () => {
    const { admin } = await seedBasic();
    const t = await login(admin.correo, 'password123');
    const c = await request(app).post('/api/admin/backups').set('Authorization', `Bearer ${t}`);
    fs.appendFileSync(path.join(BACKUP_DIR, c.body.archivo), 'tampered');

    const res = await request(app).post(`/api/admin/backups/${c.body.archivo}/restaurar`).set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 409);
    assert.match(res.body.error, /integridad/i);
  });
});
