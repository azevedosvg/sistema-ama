/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 3 — Módulo Financeiro
 * PASSOS 2 e 3 do roteiro (~1:20–3:20):
 *  · PASSO 2 — função computeSummary (a parte MAIS TÉCNICA da sua fala):
 *      a) Saldo: balance = totalReceitas + totalDoacoes − totalDespesas.
 *      b) monthlyFlow: monta os últimos 6 meses e soma entradas/saídas/
 *         doações de cada um — alimenta o gráfico de BARRAS.
 *      c) Despesas por categoria: agrupadas com um Map — alimenta a PIZZA.
 *      d) `summary` usa useMemo — só recalcula quando as transações mudam.
 *  · PASSO 3 — handleInputChange / handleSubmit (formulário):
 *      ao trocar o TIPO da transação a categoria é zerada, e há validação
 *      de valor > 0, descrição e categoria antes de criar.
 *
 * 🗣️ Fala sugerida (passo 2): "O coração do módulo é a computeSummary. Ela
 * transforma a lista bruta de transações em indicadores: o saldo, o fluxo dos
 * últimos seis meses e a divisão de despesas por categoria. Usei useMemo pra
 * não recalcular isso a cada renderização."
 * ========================================================================== */
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

// [INT. 3 · PASSO 2] A função-chave do módulo — comece sua explicação por aqui.
function computeSummary(transactions: Transaction[]): FinanceSummary {
  const totalReceitas = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0);
  const totalDespesas = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
  const totalDoacoes  = transactions.filter(t => t.type === "doacao").reduce((s, t) => s + t.amount, 0);
  // [INT. 3 · PASSO 2.a] O saldo: receitas + doações − despesas.
  const balance = totalReceitas + totalDoacoes - totalDespesas;

  // [INT. 3 · PASSO 2.b] Fluxo mensal: últimos 6 meses → gráfico de barras.
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

  // [INT. 3 · PASSO 2.c] Despesas agrupadas por categoria com um Map → gráfico de pizza.
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

  // [INT. 3 · PASSO 2.d] useMemo: o resumo só é recalculado quando as transações mudam.
  const summary = useMemo(() => computeSummary(transactions), [transactions]);

  function refresh() {
    setTransactions(getTransactions());
  }

  // [INT. 3 · PASSO 3] Detalhe esperto: trocar o TIPO zera a categoria,
  // porque cada tipo (receita/despesa/doação) tem categorias diferentes.
  function handleInputChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === "type") next.category = "";
      return next;
    });
    if (formError) setFormError("");
  }

  // [INT. 3 · PASSO 3] Validação: valor > 0, descrição e categoria — só então cria.
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
