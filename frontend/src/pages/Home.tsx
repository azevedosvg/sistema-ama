import { useEffect, useState } from "react";

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

function translateProductStatus(status: Product["status"]) {
  const statusMap: Record<Product["status"], string> = {
    expired: "Vencido",
    critical: "Crítico",
    attention: "Atenção",
    safe: "Seguro",
  };

  return statusMap[status];
}

function getProductStatusClass(status: Product["status"]) {
  const statusClassMap: Record<Product["status"], string> = {
    expired: "status-badge expired",
    critical: "status-badge critical",
    attention: "status-badge attention",
    safe: "status-badge safe",
  };

  return statusClassMap[status];
}

function formatDaysToExpire(daysToExpire: number) {
  if (daysToExpire < 0) {
    return `Vencido há ${Math.abs(daysToExpire)} dia(s)`;
  }

  if (daysToExpire === 0) {
    return "Vence hoje";
  }

  return `Vence em ${daysToExpire} dia(s)`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:3333/products")
      .then((response) => response.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <span className="badge">Projeto Fullstack</span>

        <h1>Sistema de Estoque</h1>

        <p className="subtitle">
          Controle de validade, lotes e prevenção de perdas para pequenos
          comércios.
        </p>

        <div className="hero-actions">
          <button>Entrar no Sistema</button>
          <button className="secondary">Ver funcionalidades</button>
        </div>
      </section>

      <section className="cards">
        <article className="card">
          <h2>Problema</h2>
          <p>
            Pequenos comércios frequentemente perdem produtos por vencimento
            devido à falta de controle sobre validade, lote e quantidade em
            estoque.
          </p>
        </article>

        <article className="card">
          <h2>Solução</h2>
          <p>
            O sistema permite cadastrar produtos, monitorar datas de validade,
            gerar alertas e visualizar indicadores para reduzir perdas
            financeiras.
          </p>
        </article>
        <article className="card">
          <h2>Diferencial</h2>
          <p>
            Além do controle de estoque, a aplicação prioriza produtos em risco
            e apoia decisões como promoção, doação ou descarte.
          </p>
        </article>
      </section>

      <section className="products-section">
        <h2>Produtos cadastrados</h2>

        <div className="products-list">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <h3>{product.name}</h3>
              <p>Categoria: {product.category}</p>
              <p>Quantidade: {product.quantity}</p>
              <p>Custo unitário: {formatCurrency(product.unitCost)}</p>
              <p>Valor em risco: {formatCurrency(product.riskValue)}</p>
              <p>Validade: {product.expirationDate}</p>

              <p>
                Status:{" "}
                <span className={getProductStatusClass(product.status)}>
                  {translateProductStatus(product.status)}
                </span>
              </p>

              <p>{formatDaysToExpire(product.daysToExpire)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
