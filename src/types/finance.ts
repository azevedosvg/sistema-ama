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
