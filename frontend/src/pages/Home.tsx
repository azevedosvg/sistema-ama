import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  expirationDate: string;
};

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
              <p>Categorida: {product.category}</p>
              <p>Quantidade: {product.quantity}</p>
              <p>Validade: {product.expirationDate}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
