/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 6 — Relatórios, Exportação & Dashboard
 * PASSO 3 do roteiro: "O motor de exportação" (~1:30–3:00)
 * >>> Este é o código mais interessante de explicar na sua fala. <<<
 *
 * O que apontar, nesta ordem:
 *  1. toCSV / downloadCSV — montam o CSV e disparam o download via Blob + link.
 *  2. Detalhe fino: separador ";" e BOM no início, para o Excel em português
 *     abrir com acentos e colunas corretas.
 *  3. escapeCSV — protege campos com aspas, ponto e vírgula ou quebra de linha.
 *  4. printReport — abre uma janela formatada e chama window.print(); o
 *     usuário salva como PDF (sem biblioteca).
 *  5. formatBRL / formatDateBR — dinheiro e datas no padrão brasileiro.
 *
 * 🗣️ Fala sugerida: "A exportação foi a parte que mais me exigiu atenção a
 * detalhe. Pra o CSV abrir certinho no Excel em português, usei ponto e
 * vírgula como separador e um marcador BOM pra garantir os acentos. E o PDF
 * eu gero reaproveitando a impressão do próprio navegador."
 * ========================================================================== */
// Utilitários de exportação — geração de CSV e impressão (PDF via diálogo do navegador)

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDateBR(iso: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso + "T00:00:00"));
}

// [INT. 6 · PASSO 3.3] Escapa um campo para CSV (aspas duplas e separadores)
function escapeCSV(value: string | number): string {
  const s = String(value);
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// [INT. 6 · PASSOS 3.1 e 3.2] Gera o CSV — aponte o ";" e o BOM na linha de baixo.
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

// [INT. 6 · PASSO 3.4] PDF sem biblioteca: janela formatada + window.print().
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
