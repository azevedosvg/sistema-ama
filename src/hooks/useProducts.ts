/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 2 — Módulo de Produtos (Estoque)
 * PASSO 3 do roteiro: "O estado e as ações — o hook" (~2:50–4:00)
 *
 * É o arquivo maior — NÃO leia linha a linha. Mostre só os blocos marcados
 * com [INT. 2 · PASSO 3.x] abaixo:
 *  3.1 refresh() — lê os produtos e recalcula o dashboard.
 *  3.2 handleInputChange() — categoria não perecível limpa a validade;
 *      marcar "doação" limpa o custo.
 *  3.3 validateForm() — nome, categoria, quantidade > 0, custo (se não for
 *      doação), validade (se perecível).
 *  3.4 handleSubmitProduct() — decide entre createProduct e updateProduct.
 *  3.5 displayedProducts — o .filter().sort() de busca, filtros e ordenação.
 *  3.6 Paginação — PAGE_SIZE = 6, visibleProducts e showMore() ("Ver mais").
 *  3.7 Exclusão em duas etapas — requestDeleteProduct abre o ConfirmDialog.
 *
 * 🗣️ Fala sugerida: "Esse hook concentra todo o estado da tela de estoque: o
 * formulário, os filtros e a paginação. Ele conversa com a camada de dados
 * para criar, editar e excluir, e sempre dá um refresh pra tela refletir a
 * mudança."
 * ========================================================================== */
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { DashboardData, FieldErrors, FormData, Product } from "../types/product";
import { calcDashboard, isPerishable } from "../lib/productUtils";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../lib/storage";

const EMPTY_FORM: FormData = {
  name: "",
  category: "",
  quantity: "",
  unitCost: "",
  expirationDate: "",
  isDonation: false,
  minStock: "",
};

const EMPTY_ERRORS: FieldErrors = {
  name: "",
  category: "",
  quantity: "",
  unitCost: "",
  expirationDate: "",
  minStock: "",
};

// [INT. 2 · PASSO 3.6] Tamanho da página da lista (botão "Ver mais").
const PAGE_SIZE = 6;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "">("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_ERRORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Product["status"] | "low">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOption, setSortOption] = useState<
    "" | "name" | "quantity" | "expirationDate" | "riskValue"
  >("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  // Reinicia a paginação sempre que os filtros ou a ordenação mudam.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, statusFilter, categoryFilter, sortOption]);

  // [INT. 2 · PASSO 3.1] Relê os produtos e recalcula os indicadores do dashboard.
  function refresh() {
    const all = getProducts();
    setProducts(all);
    setDashboardData(calcDashboard(all));
  }

  // [INT. 2 · PASSO 3.2] Formulário dinâmico: "doação" limpa o custo e
  // categoria não perecível limpa a validade — aponte esses dois detalhes.
  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    if (event.target instanceof HTMLInputElement && event.target.type === "checkbox") {
      const checked = event.target.checked;
      setFormData((prev) => ({ ...prev, [name]: checked, unitCost: checked ? "" : prev.unitCost }));
      return;
    }
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "category" && !isPerishable(value)) next.expirationDate = "";
      return next;
    });
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  // [INT. 2 · PASSO 3.3] Validação: nome, categoria, quantidade > 0,
  // custo (se não for doação) e validade (se a categoria for perecível).
  function validateForm(): FieldErrors {
    const errors: FieldErrors = { ...EMPTY_ERRORS };
    if (!formData.name.trim()) errors.name = "Nome é obrigatório";
    if (!formData.category.trim()) errors.category = "Categoria é obrigatória";
    if (!formData.quantity || Number(formData.quantity) <= 0)
      errors.quantity = "Quantidade deve ser maior que zero";
    if (!formData.isDonation && (!formData.unitCost || Number(formData.unitCost) <= 0))
      errors.unitCost = "Custo unitário deve ser maior que zero";
    if (isPerishable(formData.category) && !formData.expirationDate)
      errors.expirationDate = "Data de validade é obrigatória";
    if (formData.minStock && Number(formData.minStock) < 0)
      errors.minStock = "Estoque mínimo não pode ser negativo";
    setFieldErrors(errors);
    return errors;
  }

  // [INT. 2 · PASSO 3.4] Decide entre criar (createProduct) e editar (updateProduct).
  function handleSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage("");
    setFeedbackType("");

    const errors = validateForm();
    if (Object.values(errors).some((e) => e)) {
      setFeedbackMessage("Corrija os erros antes de enviar.");
      setFeedbackType("error");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      quantity: Number(formData.quantity),
      unitCost: formData.isDonation ? 0 : Number(formData.unitCost),
      expirationDate: formData.expirationDate,
      isDonation: formData.isDonation,
      minStock: formData.minStock ? Number(formData.minStock) : 0,
    };

    if (editingProductId !== null) {
      updateProduct(editingProductId, payload);
    } else {
      createProduct(payload);
    }

    refresh();
    setFormData(EMPTY_FORM);
    setEditingProductId(null);
    setSearchQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setSortOption("");
    setFeedbackMessage(editingProductId !== null ? "Produto atualizado." : "Produto cadastrado.");
    setFeedbackType("success");
    setFieldErrors(EMPTY_ERRORS);
    setIsSubmitting(false);
  }

  function handleEditProduct(product: Product) {
    setFormData({
      name: product.name,
      category: product.category,
      quantity: String(product.quantity),
      unitCost: product.isDonation ? "" : String(product.unitCost),
      expirationDate: product.expirationDate,
      isDonation: product.isDonation,
      minStock: product.minStock ? String(product.minStock) : "",
    });
    setEditingProductId(product.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // [INT. 2 · PASSO 3.7] Exclusão em duas etapas — abre o ConfirmDialog
  // (componente do Integrante 8) em vez do window.confirm nativo.
  function requestDeleteProduct(id: number) {
    setPendingDeleteId(id);
  }

  function cancelDeleteProduct() {
    setPendingDeleteId(null);
  }

  function confirmDeleteProduct() {
    if (pendingDeleteId !== null) {
      deleteProduct(pendingDeleteId);
      refresh();
    }
    setPendingDeleteId(null);
  }

  // [INT. 2 · PASSO 3.5] Busca + filtros + ordenação num único .filter().sort().
  const displayedProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter
        ? statusFilter === "low"
          ? product.lowStock
          : product.status === statusFilter
        : true;
      const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === "name") return a.name.localeCompare(b.name);
      if (sortOption === "quantity") return b.quantity - a.quantity;
      if (sortOption === "expirationDate") {
        const aTime = a.expirationDate ? new Date(a.expirationDate).getTime() : Infinity;
        const bTime = b.expirationDate ? new Date(b.expirationDate).getTime() : Infinity;
        return aTime - bTime;
      }
      if (sortOption === "riskValue") return b.riskValue - a.riskValue;
      return 0;
    });

  // [INT. 2 · PASSO 3.6] Paginação: só mostra os primeiros N; "Ver mais" amplia.
  const visibleProducts = displayedProducts.slice(0, visibleCount);
  const hasMore = displayedProducts.length > visibleCount;
  const pendingDeleteProduct = products.find((p) => p.id === pendingDeleteId) ?? null;

  function showMore() {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }

  return {
    dashboardData,
    editingProductId,
    formData,
    isSubmitting,
    feedbackMessage,
    feedbackType,
    fieldErrors,
    searchQuery,
    statusFilter,
    categoryFilter,
    sortOption,
    displayedProducts,
    visibleProducts,
    hasMore,
    showMore,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    setSortOption,
    handleInputChange,
    handleSubmitProduct,
    handleEditProduct,
    requestDeleteProduct,
    confirmDeleteProduct,
    cancelDeleteProduct,
    pendingDeleteProduct,
  };
}
