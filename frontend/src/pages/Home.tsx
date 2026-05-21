function Home() {
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
    </main>
  );
}

export default Home;
