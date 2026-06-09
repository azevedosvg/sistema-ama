// Utilitários de exportação — geração de CSV e impressão (PDF via diálogo do navegador)

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDateBR(iso: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso + "T00:00:00"));
}

// Escapa um campo para CSV (aspas duplas e separadores)
function escapeCSV(value: string | number): string {
  const s = String(value);
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Gera o conteúdo CSV a partir de cabeçalho + linhas (separador ";" para compatibilidade com Excel pt-BR)
export function toCSV(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCSV).join(";"));
  // BOM garante acentuação correta ao abrir no Excel
  return "﻿" + lines.join("\r\n");
}

// Dispara o download de um arquivo CSV
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csv = toCSV(headers, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Abre uma janela de impressão com o HTML fornecido (o usuário pode salvar como PDF)
export function printReport(title: string, bodyHTML: string): void {
  const win = window.open("", "_blank", "width=900,height=650");
  if (!win) return;
  const today = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date());
  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #1f2937; margin: 40px; }
  header { border-bottom: 3px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 24px; }
  header h1 { margin: 0; font-size: 22px; color: #1d4ed8; }
  header p { margin: 4px 0 0; color: #6b7280; font-size: 13px; }
  h2 { font-size: 16px; color: #111827; margin: 28px 0 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
  th { background: #eff6ff; color: #1e3a8a; text-align: left; padding: 8px 10px; border-bottom: 2px solid #bfdbfe; }
  td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
  tr:nth-child(even) td { background: #f8fafc; }
  .num { text-align: right; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
  @media print { body { margin: 16px; } }
</style>
</head>
<body>
<header>
  <h1>🤲 AMA — Amigos Mãos Abertas</h1>
  <p>${title} · Emitido em ${today}</p>
</header>
${bodyHTML}
<footer>Documento gerado automaticamente pelo Sistema de Gestão de Estoque AMA.</footer>
<script>window.onload = () => { window.print(); };</script>
</body>
</html>`);
  win.document.close();
}

// Monta uma tabela HTML simples para o relatório de impressão
export function htmlTable(headers: string[], rows: string[][], numericCols: number[] = []): string {
  const thead = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  const tbody = rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell, i) => `<td class="${numericCols.includes(i) ? "num" : ""}">${cell}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  return `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
}
