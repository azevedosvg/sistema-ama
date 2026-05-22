import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  expirationDate: string;
  status: "expired" | "critical" | "attention" | "safe";
  daysToExpire: number;
  riskValue: number;
};

type DashboardData = {
  totalProducts: number;
  expiredProducts: number;
  criticalProducts: number;
  attentionProducts: number;
  safeProducts: number;
  totalRiskValue: number;
};

type FieldErrors = {
  name: string;
  category: string;
  quantity: string;
  unitCost: string;
  expirationDate: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unitCost: "",
    expirationDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "">(
    "",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    name: "",
    category: "",
    quantity: "",
    unitCost: "",
    expirationDate: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Product["status"]>("");
  const [sortOption, setSortOption] = useState<
    "" | "name" | "quantity" | "expirationDate" | "riskValue"
  >("");

  useEffect(() => {
    async function fetchData() {
      await loadProducts();
      await loadDashboardData();
    }
    fetchData();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch("http://localhost:3333/products");
      if (!response.ok) throw new Error("Erro ao carregar produtos");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadDashboardData() {
    try {
      const response = await fetch("http://localhost:3333/dashboard");
      if (!response.ok) throw new Error("Erro ao carregar dashboard");
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });

    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  }

  function validateForm() {
    const errors: FieldErrors = {
      name: "",
      category: "",
      quantity: "",
      unitCost: "",
      expirationDate: "",
    };
    if (!formData.name.trim()) errors.name = "Nome é obrigatório";
    if (!formData.category.trim()) errors.category = "Categoria é obrigatória";
    if (!formData.quantity || Number(formData.quantity) <= 0)
      errors.quantity = "Quantidade deve ser maior que zero";
    if (!formData.unitCost || Number(formData.unitCost) <= 0)
      errors.unitCost = "Custo unitário deve ser maior que zero";
    if (!formData.expirationDate)
      errors.expirationDate = "Data de validade é obrigatória";
    setFieldErrors(errors);
    return errors;
  }

  async function handleSubmitProduct(event: FormEvent<HTMLFormElement>) {
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

    if (
      new Date(formData.expirationDate) <
      new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      setFeedbackMessage("A data de validade não pode ser no passado.");
      setFeedbackType("error");
      setIsSubmitting(false);
      return;
    }

    const method = editingProductId ? "PUT" : "POST";
    const url = editingProductId
      ? `http://localhost:3333/products/${editingProductId}`
      : "http://localhost:3333/products";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          quantity: Number(formData.quantity),
          unitCost: Number(formData.unitCost),
          expirationDate: formData.expirationDate,
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar o produto");

      await response.json();
      await loadProducts();
      await loadDashboardData();

      setFormData({
        name: "",
        category: "",
        quantity: "",
        unitCost: "",
        expirationDate: "",
      });
      setEditingProductId(null);
      setSearchQuery("");
      setStatusFilter("");
      setSortOption("");
      setFeedbackMessage("Produto salvo com sucesso.");
      setFeedbackType("success");
      setFieldErrors({
        name: "",
        category: "",
        quantity: "",
        unitCost: "",
        expirationDate: "",
      });
    } catch (error) {
      console.error(error);
      setFeedbackMessage("Não foi possível salvar o produto.");
      setFeedbackType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmDelete(id: number) {
    if (!window.confirm("Deseja realmente excluir este produto?")) return;
    handleDeleteProduct(id);
  }

  async function handleDeleteProduct(id: number) {
    try {
      const response = await fetch(`http://localhost:3333/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao excluir produto");
      await loadProducts();
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir o produto.");
    }
  }

  function handleEditProduct(product: Product) {
    setFormData({
      name: product.name,
      category: product.category,
      quantity: String(product.quantity),
      unitCost: String(product.unitCost),
      expirationDate: product.expirationDate,
    });
    setEditingProductId(product.id);
  }

  function translateProductStatus(status: Product["status"]) {
    const statusMap = {
      expired: "Vencido",
      critical: "Crítico",
      attention: "Atenção",
      safe: "Seguro",
    };
    return statusMap[status] || status;
  }

  const displayedProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter
        ? product.status === statusFilter
        : true;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "name") return a.name.localeCompare(b.name);
      if (sortOption === "quantity") return b.quantity - a.quantity;
      if (sortOption === "expirationDate")
        return (
          new Date(a.expirationDate).getTime() -
          new Date(b.expirationDate).getTime()
        );
      if (sortOption === "riskValue") return b.riskValue - a.riskValue;
      return 0;
    });

  return (
    <main className="container">
      <h1>Sistema de Estoque</h1>

      {dashboardData && (
        <section className="dashboard-grid">
          <div className="dashboard-card">
            <span>Total de produtos</span>
            <strong>{dashboardData.totalProducts}</strong>
          </div>
          <div className="dashboard-card highlight">
            <span>Produtos vencidos</span>
            <strong>{dashboardData.expiredProducts}</strong>
          </div>
          <div className="dashboard-card highlight">
            <span>Produtos críticos</span>
            <strong>{dashboardData.criticalProducts}</strong>
          </div>
          <div className="dashboard-card highlight">
            <span>Produtos em atenção</span>
            <strong>{dashboardData.attentionProducts}</strong>
          </div>
          <div className="dashboard-card">
            <span>Produtos seguros</span>
            <strong>{dashboardData.safeProducts}</strong>
          </div>
          <div className="dashboard-card">
            <span>Valor em risco</span>
            <strong>R$ {dashboardData.totalRiskValue.toFixed(2)}</strong>
          </div>
        </section>
      )}

      <section className="filter-section">
        <input
          type="text"
          placeholder="Buscar por nome ou categoria"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as Product["status"] | "")
          }
        >
          <option value="">Todos</option>
          <option value="expired">Vencido</option>
          <option value="critical">Crítico</option>
          <option value="attention">Atenção</option>
          <option value="safe">Seguro</option>
        </select>
        <select
          value={sortOption}
          onChange={(e) =>
            setSortOption(
              e.target.value as
                | ""
                | "name"
                | "quantity"
                | "expirationDate"
                | "riskValue",
            )
          }
        >
          <option value="">Padrão</option>
          <option value="name">Nome (A-Z)</option>
          <option value="quantity">Quantidade (maior → menor)</option>
          <option value="expirationDate">Validade (mais próxima)</option>
          <option value="riskValue">Valor em risco (maior → menor)</option>
        </select>
      </section>

      <form onSubmit={handleSubmitProduct}>
        <input
          name="name"
          type="text"
          placeholder="Nome do produto"
          value={formData.name}
          onChange={handleInputChange}
        />
        {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
        <input
          name="category"
          type="text"
          placeholder="Categoria"
          value={formData.category}
          onChange={handleInputChange}
        />
        {fieldErrors.category && (
          <span className="error">{fieldErrors.category}</span>
        )}
        <input
          name="quantity"
          type="number"
          placeholder="Quantidade"
          value={formData.quantity}
          onChange={handleInputChange}
        />
        {fieldErrors.quantity && (
          <span className="error">{fieldErrors.quantity}</span>
        )}
        <input
          name="unitCost"
          type="number"
          placeholder="Custo unitário"
          step="0.01"
          value={formData.unitCost}
          onChange={handleInputChange}
        />
        {fieldErrors.unitCost && (
          <span className="error">{fieldErrors.unitCost}</span>
        )}
        <input
          name="expirationDate"
          type="date"
          value={formData.expirationDate}
          onChange={handleInputChange}
        />
        {fieldErrors.expirationDate && (
          <span className="error">{fieldErrors.expirationDate}</span>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? editingProductId
              ? "Salvando..."
              : "Cadastrando..."
            : editingProductId
              ? "Salvar alterações"
              : "Cadastrar produto"}
        </button>
      </form>

      {feedbackMessage && (
        <p className={`feedback-message ${feedbackType}`}>{feedbackMessage}</p>
      )}

      <section className="products-list">
        {displayedProducts.map((product) => (
          <article key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.category}</p>
            <p>Qtd: {product.quantity}</p>
            <p>Preço: {product.unitCost}</p>
            <p>Validade: {product.expirationDate}</p>
            <p>Status: {translateProductStatus(product.status)}</p>
            <div className="product-actions">
              <button type="button" onClick={() => handleEditProduct(product)}>
                Editar
              </button>
              <button type="button" onClick={() => confirmDelete(product.id)}>
                Excluir
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
