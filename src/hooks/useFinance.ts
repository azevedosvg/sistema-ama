import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { FinanceSummary, Transaction, TransactionType } from "../types/finance";
import { createTransaction, deleteTransaction, getTransactions } from "../lib/storage";

const PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type TxForm = {
  type: TransactionType;
  amount: string;
  description: string;
  category: string;
  date: string;
};

const EMPTY_FORM: TxForm = {
  type: "receita",
  amount: "",
  description: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
};

function computeSummary(transactions: Transaction[]): FinanceSummary {
  const totalReceitas = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0);
  const totalDespesas = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
  const totalDoacoes  = transactions.filter(t => t.type === "doacao").reduce((s, t) => s + t.amount, 0);
  const balance = totalReceitas + totalDoacoes - totalDespesas;

  // Last 6 calendar months
  const now = new Date();
  const monthlyFlow = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const month = PT_MONTHS[d.getMonth()];
    const slice = transactions.filter(t => t.date.startsWith(key));
    return {
      month,
      entradas: slice.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0),
      saidas:   slice.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0),
      doacoes:  slice.filter(t => t.type === "doacao").reduce((s, t) => s + t.amount, 0),
    };
  });

  // Expense breakdown by category
  const expMap = new Map<string, number>();
  for (const t of transactions.filter(t => t.type === "despesa")) {
    expMap.set(t.category, (expMap.get(t.category) ?? 0) + t.amount);
  }
  const expensesByCategory = Array.from(expMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const recentTransactions = [...transactions].slice(0, 12);

  return { balance, totalReceitas, totalDespesas, totalDoacoes, monthlyFlow, expensesByCategory, recentTransactions };
}

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => getTransactions());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TxForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const summary = useMemo(() => computeSummary(transactions), [transactions]);

  function refresh() {
    setTransactions(getTransactions());
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === "type") next.category = "";
      return next;
    });
    if (formError) setFormError("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError("Informe um valor maior que zero.");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Descrição é obrigatória.");
      return;
    }
    if (!formData.category) {
      setFormError("Selecione uma categoria.");
      return;
    }
    createTransaction({
      type: formData.type,
      amount: Number(formData.amount),
      description: formData.description.trim(),
      category: formData.category,
      date: formData.date,
    });
    refresh();
    setFormData(EMPTY_FORM);
    setShowForm(false);
    setFormError("");
  }

  function handleDelete(id: number) {
    if (!window.confirm("Remover esta movimentação?")) return;
    deleteTransaction(id);
    refresh();
  }

  return {
    summary,
    transactions,
    showForm,
    formData,
    formError,
    setShowForm,
    handleInputChange,
    handleSubmit,
    handleDelete,
  };
}
