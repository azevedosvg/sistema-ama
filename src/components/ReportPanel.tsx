import { motion } from "framer-motion";
import { Boxes, Download, FileText, Printer, Wallet } from "lucide-react";
import { useMemo } from "react";
import { getMovements, getProducts, getTransactions } from "../lib/storage";
import {
  downloadCSV,
  formatBRL,
  formatDateBR,
  htmlTable,
  printReport,
} from "../lib/exportUtils";
import { useToast } from "./ui/Toast";

const STATUS_LABEL: Record<string, string> = {
  expired: "Vencido",
  critical: "Crítico",
  attention: "Em atenção",
  safe: "Seguro",
};

const TYPE_LABEL: Record<string, string> = {
  receita: "Receita",
  despesa: "Despesa",
  doacao: "Doação",
};

type ReportCard = {
  key: string;
  title: string;
  description: string;
  icon: typeof Boxes;
  accent: string;
  count: number;
  onCSV: () => void;
  onPrint: () => void;
};

export default function ReportPanel() {
  const { notify } = useToast();

  const cards = useMemo<ReportCard[]>(() => {
    const products = getProducts();
    const transactions = getTransactions();
    const movements = getMovements();

    // ── Estoque ──
    const productHeaders = ["Nome", "Categoria", "Quantidade", "Custo unit. (R$)", "Validade", "Status", "Doação"];
    const productRows = products.map((p) => [
      p.name,
      p.category,
      String(p.quantity),
      p.isDonation ? "—" : p.unitCost.toFixed(2),
      formatDateBR(p.expirationDate),
      STATUS_LABEL[p.status] ?? p.status,
      p.isDonation ? "Sim" : "Não",
    ]);

    // ── Financeiro ──
    const txHeaders = ["Data", "Tipo", "Descrição", "Categoria", "Valor (R$)"];
    const txRows = transactions.map((t) => [
      formatDateBR(t.date),
      TYPE_LABEL[t.type] ?? t.type,
      t.description,
      t.category,
      t.amount.toFixed(2),
    ]);
    const totalReceitas = transactions.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const totalDespesas = transactions.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    const totalDoacoes = transactions.filter((t) => t.type === "doacao").reduce((s, t) => s + t.amount, 0);

    // ── Movimentações ──
    const movHeaders = ["Data", "Tipo", "Produto", "Quantidade", "Motivo", "Responsável"];
    const movRows = movements.map((m) => [
      formatDateBR(m.date),
      m.type === "entrada" ? "Entrada" : "Saída",
      m.productName,
      (m.type === "entrada" ? "+" : "−") + m.quantity,
      m.reason,
      m.user,
    ]);

    return [
      {
        key: "estoque",
        title: "Relatório de Estoque",
        description: "Todos os produtos com quantidade, validade, status e valor.",
        icon: Boxes,
        accent: "from-blue-600 to-blue-700",
        count: products.length,
        onCSV: () => downloadCSV("estoque-ama", productHeaders, productRows),
        onPrint: () =>
          printReport(
            "Relatório de Estoque",
            `<h2>Produtos cadastrados (${products.length})</h2>` +
              htmlTable(productHeaders, productRows, [2, 3]),
          ),
      },
      {
        key: "financeiro",
        title: "Relatório Financeiro",
        description: "Receitas, despesas e doações com totais consolidados.",
        icon: Wallet,
        accent: "from-emerald-600 to-emerald-700",
        count: transactions.length,
        onCSV: () => downloadCSV("financeiro-ama", txHeaders, txRows),
        onPrint: () =>
          printReport(
            "Relatório Financeiro",
            `<h2>Resumo</h2>` +
              htmlTable(
                ["Indicador", "Valor"],
                [
                  ["Total de receitas", formatBRL(totalReceitas)],
                  ["Total de doações", formatBRL(totalDoacoes)],
                  ["Total de despesas", formatBRL(totalDespesas)],
                  ["Saldo atual", formatBRL(totalReceitas + totalDoacoes - totalDespesas)],
                ],
                [1],
              ) +
              `<h2>Transações (${transactions.length})</h2>` +
              htmlTable(txHeaders, txRows, [4]),
          ),
      },
      {
        key: "movimentacoes",
        title: "Relatório de Movimentações",
        description: "Entradas e saídas de itens com motivo e responsável.",
        icon: FileText,
        accent: "from-amber-500 to-amber-600",
        count: movements.length,
        onCSV: () => downloadCSV("movimentacoes-ama", movHeaders, movRows),
        onPrint: () =>
          printReport(
            "Relatório de Movimentações",
            `<h2>Movimentações de estoque (${movements.length})</h2>` +
              htmlTable(movHeaders, movRows, [3]),
          ),
      },
    ];
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 flex-shrink-0 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Relatórios e Exportação</h2>
          <p className="text-sm text-gray-400">
            Baixe os dados em CSV (Excel) ou gere um PDF pela impressão do navegador
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              whileHover={{ y: -3 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`flex items-center gap-3 bg-linear-to-br ${card.accent} p-5`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">{card.title}</p>
                  <p className="text-xs text-white/80">{card.count} registros</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="flex-1 text-sm text-gray-500">{card.description}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      card.onCSV();
                      notify(`${card.title} exportado em CSV.`, "success");
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Download size={15} /> CSV
                  </button>
                  <button
                    type="button"
                    onClick={card.onPrint}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 px-3 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Printer size={15} /> Imprimir
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-4 text-sm text-blue-800">
        💡 <strong>Dica:</strong> no diálogo de impressão, escolha &ldquo;Salvar como PDF&rdquo; em
        Destino para gerar um arquivo PDF do relatório.
      </p>
    </div>
  );
}
