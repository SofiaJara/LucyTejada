-- CreateTable
CREATE TABLE "Bitacora" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" INTEGER,
    "descripcion" TEXT NOT NULL,
    "usuarioId" INTEGER,
    "usuarioCorreo" TEXT,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Bitacora_createdAt_idx" ON "Bitacora"("createdAt");

-- CreateIndex
CREATE INDEX "Bitacora_usuarioId_idx" ON "Bitacora"("usuarioId");
