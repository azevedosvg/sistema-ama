/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 3 — Módulo Financeiro
 * PASSO 1 do roteiro: "Os tipos financeiros" (~0:40–1:20)
 *
 * O que falar: mostre TransactionType = "receita" | "despesa" | "doacao",
 * o tipo Transaction, o FinanceSummary (o "resumo" que a lógica calcula)
 * e o TRANSACTION_CATEGORIES (categorias de cada tipo).
 *
 * 🗣️ Fala sugerida: "Toda movimentação financeira é uma transação de um de
 * três tipos. O resumo financeiro junta tudo isso em números prontos para
 * a tela."
 * ========================================================================== */
export type TransactionType = "receita" | "despesa" | "doacao";

export type Transaction = {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
};

export type MonthlyFlow = {
  month: string;
  entradas: number;
  saidas: number;
  doacoes: number;
};

export type ExpenseByCategory = {
  name: string;
  value: number;
};

// [INT. 3 · PASSO 1] O "resumo" calculado pela computeSummary (useFinance.ts).
export type FinanceSummary = {
  balance: number;
  totalReceitas: number;
  totalDespesas: number;
  totalDoacoes: number;
  monthlyFlow: MonthlyFlow[];
  expensesByCategory: ExpenseByCategory[];
  recentTransactions: Transaction[];
};

export const TRANSACTION_CATEGORIES: Record<TransactionType, string[]> = {
  receita: ["Evento de Arrecadação", "Mensalidades", "Parceria Institucional", "Projeto Social", "Outros"],
  despesa: ["Compra de Estoque", "Logística e Transporte", "Administrativo", "Serviços Gerais", "Outros"],
  doacao: ["Pessoa Física", "Empresa", "Campanha Online", "Fundo Social", "Outros"],
};
