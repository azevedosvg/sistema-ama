/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 4 — Movimentação de Estoque
 * PASSO 2 do roteiro: "A validação inteligente" (~1:20–2:00)
 *
 * O que falar neste arquivo:
 *  1. A função validate() — o detalhe MAIS IMPORTANTE: numa SAÍDA, o código
 *     confere se há estoque suficiente; se a quantidade pedida for maior que
 *     a disponível, bloqueia com "Estoque insuficiente: há apenas X em…".
 *  2. Os totais (entradas, saidas, saldo) calculados em `totals`.
 *
 * 🗣️ Fala sugerida: "Antes de registrar uma saída, eu confiro se o produto tem
 * quantidade suficiente. Não dá pra dar baixa de 50 unidades se só existem 12
 * — o sistema impede isso."
 *
 * (O PASSO 3 — ajuste automático do estoque — fica em src/lib/storage.ts:
 * createMovement / adjustProductStock / deleteMovement.)
 * ========================================================================== */
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { MovementType, StockMovement } from "../types/movement";
import type { Product } from "../types/product";
import { createMovement, deleteMovement, getMovements, getProducts } from "../lib/storage";

type MovForm = {
  productId: string;
  type: MovementType;
  quantity: string;
  reason: string;
  party: string;
  date: string;
};

const EMPTY_FORM: MovForm = {
  productId: "",
  type: "entrada",
  quantity: "",
  reason: "",
  party: "",
  date: new Date().toISOString().slice(0, 10),
};

export function useMovements() {
  const [movements, setMovements] = useState<StockMovement[]>(() => getMovements());
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [form, setForm] = useState<MovForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | MovementType>("");

  function refresh() {
    setMovements(getMovements());
    setProducts(getProducts());
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  }

  // [INT. 4 · PASSO 2.1] A validação inteligente — mostre principalmente o
  // bloco da saída, que bloqueia a baixa quando não há estoque suficiente.
  function validate(): string {
    if (!form.productId) return "Selecione um produto.";
    const qty = Number(form.quantity);
    if (!form.quantity || qty <= 0) return "Informe uma quantidade maior que zero.";
    if (!form.reason) return "Selecione um motivo.";
    // [INT. 4 · PASSO 2.1] Saída maior que o disponível? Bloqueia aqui.
    if (form.type === "saida") {
      const product = products.find((p) => p.id === Number(form.productId));
      if (product && qty > product.quantity) {
        return `Estoque insuficiente: há apenas ${product.quantity} em "${product.name}".`;
      }
    }
    return "";
  }

  function handleSubmit(e: FormEvent): boolean {
    e.preventDefault();
    const error = validate();
    if (error) {
      setFormError(error);
      return false;
    }
    createMovement({
      productId: Number(form.productId),
      type: form.type,
      quantity: Number(form.quantity),
      reason: form.reason,
      party: form.party.trim() || undefined,
      date: form.date,
    });
    refresh();
    setForm({ ...EMPTY_FORM, date: form.date });
    setFormError("");
    return true;
  }

  function handleDelete(id: number) {
    deleteMovement(id);
    refresh();
  }

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const matchesType = typeFilter ? m.type === typeFilter : true;
      const q = search.toLowerCase();
      const matchesSearch =
        m.productName.toLowerCase().includes(q) || m.reason.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [movements, typeFilter, search]);

  // [INT. 4 · PASSO 2.2] Os totais exibidos na tela: entradas, saídas e saldo.
  const totals = useMemo(() => {
    const entradas = movements.filter((m) => m.type === "entrada").reduce((s, m) => s + m.quantity, 0);
    const saidas = movements.filter((m) => m.type === "saida").reduce((s, m) => s + m.quantity, 0);
    return { entradas, saidas, saldo: entradas - saidas, total: movements.length };
  }, [movements]);

  return {
    movements: filtered,
    allCount: movements.length,
    products,
    form,
    formError,
    search,
    typeFilter,
    totals,
    setSearch,
    setTypeFilter,
    handleInputChange,
    handleSubmit,
    handleDelete,
  };
}
