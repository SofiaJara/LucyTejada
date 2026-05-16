"use client";

// Exportadores nativos (sin dependencias externas): CSV, Excel (XML SpreadsheetML) y PDF (window.print)

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? "";
      const str = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(",")),
  ].join("\n");
  download(filename, "﻿" + csv, "text/csv;charset=utf-8;");
}

// Excel 2003 XML format — abierto nativo por Excel sin dependencias
export function exportXLS(filename, rows, title = "Reporte") {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const esc = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#3A6048" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF" ss:Bold="1"/></Style>
  </Styles>
  <Worksheet ss:Name="${esc(title)}">
    <Table>
      <Row>${headers.map(h => `<Cell ss:StyleID="header"><Data ss:Type="String">${esc(h)}</Data></Cell>`).join("")}</Row>
      ${rows.map(r => `<Row>${headers.map(h => {
        const v = r[h];
        const isNumber = typeof v === "number";
        return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${esc(v)}</Data></Cell>`;
      }).join("")}</Row>`).join("")}
    </Table>
  </Worksheet>
</Workbook>`;
  download(filename, xml, "application/vnd.ms-excel");
}

export function exportPDF(title, rows, subtitulo = "") {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const fecha = new Date().toLocaleString("es-CO");
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 30px; color: #2c3a32; }
  h1 { color: #1E2D26; margin-bottom: 4px; }
  .subtitle { color: #4a5a52; font-size: 13px; margin-bottom: 22px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #3A6048; color: white; padding: 8px; text-align: left; font-weight: 700; }
  td { padding: 7px 8px; border-bottom: 1px solid #d8e8df; color: #2c3a32; }
  tr:nth-child(even) td { background: #f7faf8; }
  .footer { margin-top: 30px; font-size: 11px; color: #888; text-align: center; }
  @media print { body { padding: 0; } }
</style></head>
<body>
<h1>${title}</h1>
<div class="subtitle">${subtitulo} · Centro Cultural Lucy Tejada · Generado: ${fecha}</div>
<table>
  <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${headers.map(h => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
</table>
<div class="footer">Sistema de Gestión — Centro Cultural Lucy Tejada</div>
<script>window.onload = () => { window.print(); }</script>
</body></html>`;
  const win = window.open("", "_blank");
  if (!win) {
    alert("Permite ventanas emergentes para exportar a PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
