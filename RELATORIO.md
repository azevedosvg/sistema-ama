# Relatório do Projeto — AMA Sistema de Gestão

**Organização:** Amigos Mãos Abertas (AMA)
**Data:** Maio de 2026
**Versão do sistema:** 1.0

---

## 1. O Que é o Sistema

O AMA Sistema de Gestão é uma aplicação web desenvolvida para controlar o estoque de donativos e as finanças da ONG Amigos Mãos Abertas. Ele permite que voluntários e coordenadores registrem, acompanhem e gerenciem os itens recebidos e distribuídos pela organização, além de controlar entradas e saídas financeiras.

---

## 2. O Que Já Está Pronto

### Módulo de Estoque

- Cadastro de produtos com nome, categoria, quantidade, custo unitário e validade
- Distinção entre itens comprados e doações (badge visual diferenciado)
- Categorias não perecíveis (roupas, calçados, brinquedos) não exigem data de validade — o formulário se adapta automaticamente
- Cálculo automático de status por prazo de vencimento: **Vencido / Crítico / Atenção / Seguro**
- Cálculo de **valor em risco** (quantidade × custo unitário) para itens próximos do vencimento
- Busca por nome/categoria, filtros por status e categoria, ordenação múltipla
- Dashboard com indicadores: total de produtos, quantidade por status, valor total em risco

### Módulo Financeiro

- Registro de **receitas** (eventos, parcerias, subvenções), **despesas** (transporte, aluguel, materiais) e **doações em dinheiro**
- Saldo de caixa calculado em tempo real
- Gráfico de barras: fluxo mensal dos últimos 6 meses (entradas × saídas × doações)
- Gráfico de pizza: distribuição de despesas por categoria
- Lista de transações recentes com exclusão

### Autenticação

- Tela de login e cadastro de usuários
- Botão de mostrar/ocultar senha nos formulários de login e cadastro
- Usuário administrador padrão pré-configurado: `admin@ama.org` / `admin123`
- Sessão mantida após fechar o navegador

### Histórico de Alterações (Auditoria)

- Registro automático de quem **entrou** e **saiu** do sistema
- Registro de tudo que foi **cadastrado, editado ou removido** — produtos e movimentações financeiras
- Em edições, mostra o que mudou campo a campo (ex.: "Quantidade: 48 → 50")
- Linha do tempo agrupada por dia, com filtros por tipo de ação e por usuário
- Hoje armazenado no navegador; migrará para o banco de dados na versão de produção

### Interface

- Design responsivo (funciona em desktop, tablet e celular)
- Tema visual azul e âmbar, identidade visual da AMA
- Animações e transições fluidas
- Ilustração SVG de solidariedade na tela de login

---

## 3. Limitações da Versão Atual

Esta é uma versão **de demonstração** que usa o armazenamento local do navegador (`localStorage`). Isso significa:

| Limitação                | Impacto Prático                                                           |
| ------------------------ | ------------------------------------------------------------------------- |
| Dados ficam no navegador | Cada computador tem sua própria base de dados — não há compartilhamento   |
| Sem backup automático    | Se o navegador for limpo, todos os dados são perdidos                     |
| Sem acesso remoto        | Não é possível acessar de outro computador ou celular com os mesmos dados |
| Apenas 1 usuário efetivo | Múltiplos usuários não veem os dados uns dos outros                       |
| Senhas em texto simples  | A segurança da autenticação não é adequada para produção                  |
| Sem notificações         | Não há alertas automáticos por e-mail sobre produtos vencendo             |

---

## 4. O Que É Necessário Para Implantação Real

Para que o sistema funcione de verdade na instituição — com dados compartilhados entre voluntários, acesso de qualquer lugar e segurança adequada — são necessários os seguintes componentes:

### 4.1 Hospedagem do Frontend (Gratuito)

O código React atual pode ser publicado diretamente em plataformas como **Vercel** ou **Netlify**, que oferecem planos gratuitos para organizações sem fins lucrativos.

- Upload do projeto via Git (GitHub)
- SSL (HTTPS) automático e gratuito
- Domínio personalizado: `ama.org.br` (~R$ 40/ano via Registro.br)

### 4.2 Backend — API do Sistema (A Construir)

O maior item a desenvolver. Atualmente não existe backend. Será necessário criar um servidor que:

- Receba requisições do frontend via API REST
- Valide dados e aplique as regras de negócio
- Gerencie autenticação com tokens JWT e senhas criptografadas (bcrypt)
- Implemente níveis de acesso: **Administrador**, **Coordenador**, **Voluntário**

**Tecnologia recomendada:** Node.js + Express ou Fastify
**Hospedagem recomendada:** Railway ou Render.com (~$7/mês)

### 4.3 Banco de Dados (Gratuito até certo ponto)

Substituirá o `localStorage`. Armazenará todos os dados de forma centralizada e com backup automático.

- **Produtos** (estoque, categorias, validade, status)
- **Transações financeiras** (receitas, despesas, doações)
- **Usuários e permissões**
- **Log de atividades** (quem alterou o quê e quando)

**Tecnologia recomendada:** PostgreSQL via **Supabase** (free tier generoso) ou Railway
**Backup:** automático diário incluído

### 4.4 Notificações por E-mail (Opcional, mas Recomendado)

Alertas automáticos enviados para os coordenadores quando:

- Produtos estão vencendo em 7 dias ou menos
- Estoque de um item cai para zero
- Relatório semanal do estoque (toda segunda-feira)

**Tecnologia recomendada:** SendGrid (100 e-mails/dia gratuitos)

---

## 5. Estimativa de Custos Mensais

| Componente         | Serviço                    | Custo                      |
| ------------------ | -------------------------- | -------------------------- |
| Frontend           | Vercel / Netlify           | **Gratuito**               |
| Backend (API)      | Railway ou Render          | ~R$ 35–80/mês              |
| Banco de dados     | Supabase (free) ou Railway | **Gratuito** (até 500MB)   |
| E-mail             | SendGrid                   | **Gratuito** (até 100/dia) |
| Domínio            | Registro.br (ama.org.br)   | ~R$ 40/ano (~R$ 3,50/mês)  |
| **Total estimado** |                            | **~R$ 40–85/mês**          |

> O custo pode ser zero nos primeiros meses usando apenas planos gratuitos, dependendo do volume de uso.

---

## 6. Estimativa de Prazo

Assumindo 1 desenvolvedor backend com experiência em Node.js e PostgreSQL:

| Fase      | Atividade                                                    | Prazo Estimado  |
| --------- | ------------------------------------------------------------ | --------------- |
| 1         | Configuração de infraestrutura (hosting, banco, domínio)     | 3–5 dias        |
| 2         | Desenvolvimento do backend (API + autenticação + CRUD)       | 2–3 semanas     |
| 3         | Adaptação do frontend (trocar localStorage por chamadas API) | 1 semana        |
| 4         | Testes, migração de dados e treinamento da equipe            | 1 semana        |
| **Total** |                                                              | **4–6 semanas** |

---

## 8. Próximos Passos Recomendados

1. **Imediato:** Usar a versão atual localmente para testar fluxos e validar com a equipe se os campos e relatórios fazem sentido para a operação da ONG
2. **Médio prazo:** Contratar hospedagem e publicar o sistema com acesso para todos os voluntários
3. **Longo prazo:** Adicionar exportação de relatórios em PDF, módulo de distribuição de donativos por família, e integração com planilhas Google

---

## 9. Tecnologias Utilizadas (Frontend — Já Pronto)

| Tecnologia    | Versão | Função                              |
| ------------- | ------ | ----------------------------------- |
| React         | 19     | Interface do usuário                |
| TypeScript    | 5.x    | Tipagem e segurança de código       |
| Vite          | 8.x    | Build e servidor de desenvolvimento |
| Tailwind CSS  | 4.3    | Estilização                         |
| Framer Motion | 12     | Animações                           |
| React Router  | 7      | Navegação entre telas               |
| Lucide React  | latest | Ícones                              |

---

_Relatório gerado em maio de 2026 · AMA — Amigos Mãos Abertas · Sistema de Gestão de Estoque_
