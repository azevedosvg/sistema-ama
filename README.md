# sistema-ama — Sistema de Gestão de Estoque AMA

Sistema de controle de estoque e financeiro desenvolvido para a ONG **Amigos Mãos Abertas (AMA)**, uma organização solidária que distribui alimentos, roupas, medicamentos e outros itens para comunidades carentes.

---

## Visão Geral

A aplicação é organizada em 7 abas (a última restrita a administradores):

| Aba | O que faz |
|---|---|
| **Visão Geral** | Dashboard inicial que cruza estoque, finanças e atividades numa só tela |
| **Estoque** | Cadastro, edição, exclusão e busca de produtos com filtros avançados |
| **Movimentação** | Entradas e saídas que ajustam a quantidade do produto automaticamente |
| **Financeiro** | Caixa, receitas, despesas e doações com gráficos visuais |
| **Relatórios** | Exportação de estoque, financeiro e movimentações em CSV (Excel) ou PDF (impressão) |
| **Histórico** | Auditoria de quem entrou, quem saiu e o que foi cadastrado, editado ou removido |
| **Usuários** | Gestão de papéis (administrador / voluntário) — visível apenas para administradores |

Outros recursos:

- **Autenticação**: login e cadastro com persistência local (botão de mostrar/ocultar senha)
- **Notificações**: sino no header com alertas de produtos vencidos, críticos e com estoque baixo
- **Estoque mínimo**: campo `minStock` por produto, com alerta de reposição quando a quantidade chega ao nível mínimo
- **Indicadores de status**: vencimento de produtos com alertas por prazo (vencido, crítico, atenção, seguro)
- **UX**: toasts, modais de confirmação, estados de vazio, navegação inferior no mobile e botão de voltar ao topo

---

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Framework de UI |
| TypeScript | 6.x | Tipagem estática |
| Vite | 8.x | Bundler e dev server |
| Tailwind CSS | 4.3 | Estilização utility-first |
| Framer Motion | 12 | Animações e transições |
| React Router DOM | 7 | Roteamento SPA |
| Lucide React | 1.x | Ícones |

> **Persistência**: 100% via `localStorage` — sem backend, sem banco de dados. Os gráficos são SVG nativos, sem biblioteca de charts.

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### Build de Produção

```bash
npm run build
npm run preview
```

---

## Credenciais Padrão

A aplicação injeta automaticamente um usuário administrador no primeiro acesso:

| Campo | Valor |
|---|---|
| Email | `admin@ama.org` |
| Senha | `admin123` |

> Esse usuário é permanente: não pode ser rebaixado nem excluído, garantindo acesso de administrador sempre.

O seed também cria 7 usuários de exemplo (senha `senha123`), entre administradores (`fernanda.gestora@ama.org`, `lucia.admin@ama.org`) e voluntários (`ana.voluntaria@ama.org`, `joao.voluntario@ama.org`, etc.).

---

## Estrutura de Pastas

```
sistema-estoque/
├── src/
│   ├── components/
│   │   ├── ui/                  # Componentes-base do design system
│   │   │   ├── ConfirmDialog.tsx    # Modal de confirmação (excluir etc.)
│   │   │   ├── EmptyState.tsx       # Estado de vazio reutilizável
│   │   │   ├── Modal.tsx            # Modal genérico
│   │   │   └── Toast.tsx            # Notificações (useToast)
│   │   ├── ActivityLog.tsx      # Histórico de alterações (linha do tempo + filtros)
│   │   ├── BottomNav.tsx        # Navegação inferior (mobile)
│   │   ├── BudgetPanel.tsx      # Painel financeiro (gráficos + transações)
│   │   ├── Dashboard.tsx        # Cards de indicadores do estoque
│   │   ├── Footer.tsx           # Rodapé
│   │   ├── Logo.tsx / LogoMark.tsx  # Identidade visual
│   │   ├── NotificationBell.tsx # Sino de alertas (vencidos, críticos, estoque baixo)
│   │   ├── Overview.tsx         # Aba Visão Geral (resumo consolidado)
│   │   ├── PrivateRoute.tsx     # Proteção de rotas autenticadas
│   │   ├── ProductCard.tsx      # Card individual de produto
│   │   ├── ProductFilters.tsx   # Barra de busca e filtros
│   │   ├── ProductForm.tsx      # Formulário de cadastro/edição de produto
│   │   ├── ProductList.tsx      # Grade de cards de produtos (com "mostrar mais")
│   │   ├── ReportPanel.tsx      # Aba Relatórios (exportação CSV/PDF)
│   │   ├── ScrollToTopButton.tsx# Botão de voltar ao topo
│   │   ├── StockMovement.tsx    # Aba Movimentação (entradas e saídas)
│   │   └── UserManagement.tsx   # Aba Usuários (papéis, admin only)
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto de autenticação global (login/logout, papel, isAdmin)
│   ├── hooks/
│   │   ├── useActivities.ts     # Estado e filtros do histórico de alterações
│   │   ├── useFinance.ts        # Estado e lógica do módulo financeiro
│   │   ├── useMovements.ts      # Estado e lógica da movimentação de estoque
│   │   ├── useProducts.ts       # Estado e lógica do módulo de produtos
│   │   └── useUsers.ts          # Estado e lógica da gestão de usuários
│   ├── lib/
│   │   ├── exportUtils.ts       # CSV (separador ";" + BOM) e impressão/PDF
│   │   ├── productUtils.ts      # Regras puras: status, validade, estoque baixo, dashboard
│   │   └── storage.ts           # Toda a persistência localStorage + seeds + log de atividades
│   ├── pages/
│   │   ├── Home.tsx             # Página principal (7 abas)
│   │   ├── Login.tsx            # Tela de login com ilustração SVG
│   │   └── Register.tsx         # Tela de cadastro de usuário
│   ├── types/
│   │   ├── activity.ts          # Tipos do histórico (Activity, FieldChange)
│   │   ├── finance.ts           # Tipos do módulo financeiro
│   │   ├── movement.ts          # Tipos de movimentação de estoque
│   │   ├── product.ts           # Tipo Product e dados do dashboard
│   │   └── user.ts              # Papéis de usuário (admin / voluntario)
│   ├── App.tsx                  # Rotas e proteção de autenticação
│   └── main.tsx                 # Entry point React
├── public/
├── index.html
├── package.json
└── vite.config.ts
```

---

## Arquitetura

### Fluxo de Dados

```
localStorage
    ↕
storage.ts (CRUD + seeds + log de atividades)
    ↕
useProducts / useFinance / useMovements / useActivities / useUsers (hooks de estado)
    ↕
Home.tsx (orquestra as abas)
    ↕
Componentes visuais (Overview, Dashboard, BudgetPanel, StockMovement, ReportPanel...)
```

### Proteção de Rotas e Acesso

- `App.tsx` usa `AuthContext` (via `PrivateRoute`) para redirecionar usuários não autenticados para `/login`.
- Rotas: `/` → `Home` (requer login), `/login` e `/register` (públicas).
- A aba **Usuários** tem proteção dupla: é filtrada da navegação quando o usuário não é admin (`adminOnly: true`) **e** a renderização revalida `isAdmin` antes de exibir o conteúdo.

---

## Módulo de Produtos

### Tipo `Product`

```typescript
type Product = {
  // Preenchidos pelo usuário
  id: number;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  expirationDate: string;   // "YYYY-MM-DD" ou "" para não perecíveis
  isDonation: boolean;      // true = custo zero, badge "Doação"
  minStock: number;         // estoque mínimo (0 = sem alerta)

  // Calculados pelo sistema (via enrich() em productUtils.ts)
  status: "expired" | "critical" | "attention" | "safe";
  daysToExpire: number;
  riskValue: number;        // quantity × unitCost para itens em risco (0 para doações)
  lowStock: boolean;        // true quando minStock > 0 e quantity <= minStock
};
```

### Categorias e Perecibilidade

Categorias perecíveis (exigem data de validade):

- Alimentos, Bebidas, Higiene e Limpeza, Medicamentos

Categorias não perecíveis (campo de validade oculto no formulário):

- Roupas, Calçados, Eletrônicos, Brinquedos, Móveis, Utensílios Domésticos, Material Escolar, Outros

A lógica é centralizada em `productUtils.ts`:

```typescript
export const PERISHABLE_CATEGORIES = new Set([
  "Alimentos", "Bebidas", "Higiene e Limpeza", "Medicamentos"
]);
export function isPerishable(category: string): boolean {
  return PERISHABLE_CATEGORIES.has(category);
}
```

### Cálculo de Status

| Status | Condição |
|---|---|
| `expired` | `daysToExpire < 0` |
| `critical` | `0 <= daysToExpire <= 7` |
| `attention` | `8 <= daysToExpire <= 30` |
| `safe` | `daysToExpire > 30` ou sem validade |

### Valor em Risco (`riskValue`)

Calculado para produtos com status `critical` ou `expired` (doações ficam de fora):

```
riskValue = quantity × unitCost
```

---

## Módulo de Movimentação de Estoque

Registra entradas (reposição/recebimento) e saídas (distribuição/baixa) e **ajusta a quantidade do produto automaticamente**.

### Tipo `StockMovement`

```typescript
type StockMovement = {
  id: number;
  productId: number;
  productName: string;
  type: "entrada" | "saida";
  quantity: number;
  reason: string;   // motivo da entrada ou destino da saída
  party?: string;   // doador/fornecedor (entrada) ou beneficiário/destino (saída)
  date: string;     // "YYYY-MM-DD"
  user: string;     // quem registrou (email)
};
```

### Regras

- `createMovement()` chama `adjustProductStock()`: entrada soma, saída subtrai (`Math.max(0, …)` impede quantidade negativa).
- Apagar uma movimentação **reverte** o efeito no estoque (uma saída apagada devolve as unidades).
- Motivos sugeridos por tipo: entrada (Compra, Doação recebida, Devolução, Ajuste de inventário, Outros) e saída (Distribuição, Doação entregue, Perda/Vencimento, Ajuste de inventário, Outros).

---

## Módulo Financeiro

### Tipos

```typescript
type TransactionType = "receita" | "despesa" | "doacao";

type Transaction = {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;          // "YYYY-MM-DD"
};
```

### Resumo Financeiro (`FinanceSummary`)

Calculado via `computeSummary()` em `useFinance.ts`:

- **`balance`**: soma de receitas e doações menos despesas
- **`totalReceitas`** / **`totalDespesas`** / **`totalDoacoes`**: somas por tipo
- **`monthlyFlow`**: entradas/saídas/doações dos últimos 6 meses (para o gráfico de barras)
- **`expensesByCategory`**: despesas agrupadas por categoria (para o gráfico de pizza)
- **`recentTransactions`**: últimas transações ordenadas por data

### Categorias de Transação

```
Receita:  Evento de Arrecadação, Mensalidades, Parceria Institucional, Projeto Social, Outros
Despesa:  Compra de Estoque, Logística e Transporte, Administrativo, Serviços Gerais, Outros
Doação:   Pessoa Física, Empresa, Campanha Online, Fundo Social, Outros
```

### Gráficos (SVG nativos)

- **Gráfico de Barras**: fluxo mensal dos últimos 6 meses — azul (entradas), vermelho (saídas), âmbar (doações)
- **Gráfico de Pizza (donut)**: distribuição de despesas por categoria, com arcos SVG calculados manualmente

---

## Módulo de Relatórios e Exportação

`ReportPanel.tsx` gera três relatórios — **Estoque**, **Financeiro** e **Movimentações** — em dois formatos, via `exportUtils.ts`:

- **CSV (Excel)**: `downloadCSV()` monta o arquivo com separador `;` e BOM no início, para o Excel em português abrir com acentos e colunas corretas (`escapeCSV` protege campos com aspas, `;` ou quebras de linha).
- **PDF (impressão)**: `printReport()` abre uma janela formatada e chama `window.print()` — o usuário salva como PDF sem nenhuma biblioteca externa.

Também exporta `formatBRL()` e `formatDateBR()` para dinheiro e datas no padrão brasileiro.

---

## Módulo de Histórico (Auditoria)

Registra automaticamente as ações do sistema, respondendo "quem fez, o quê e quando".

### Tipo `Activity`

```typescript
type Activity = {
  id: number;
  timestamp: string;   // ISO — quando aconteceu
  user: string;        // email do responsável
  action: "login" | "logout" | "register" | "create" | "update" | "delete";
  entity: "produto" | "movimentação" | "estoque" | "sessão" | "usuário";
  target: string;          // nome do item afetado
  changes?: FieldChange[]; // alterações campo a campo (apenas em "update")
};
```

### O que é registrado

| Ação | Origem | Exemplo |
|---|---|---|
| `login` / `logout` | `AuthContext` | "fulano entrou no sistema" |
| `register` | `registerUser` | "fulano criou a conta" |
| `create` / `update` / `delete` (produto) | `storage.ts` | "editou produto Leite Integral 1L" |
| `create` / `delete` (estoque) | `createMovement` / `deleteMovement` | "Entrada · Leite Integral 1L (24)" |
| `create` / `delete` (movimentação financeira) | `createTransaction` / `deleteTransaction` | "removeu Compra de alimentos" |
| `update` / `delete` (usuário) | `updateUserRole` / `deleteUser` | "alterou papel de fulano" |

Em edições de produto, `diffProduct()` compara o estado anterior com o novo e gera uma lista de `FieldChange` (`{ field, label, from, to }`), exibida na interface como `Quantidade: 48 → 50`.

### Como funciona

- Todas as funções de mutação em `storage.ts` chamam `logActivity()`; `logLogin()` / `logLogout()` são acionadas pelo `AuthContext`.
- Os registros ficam em `localStorage` (`ama_activities`), limitados aos **500 mais recentes** (`ACTIVITY_CAP`).
- `ActivityLog.tsx` exibe uma linha do tempo agrupada por dia, com filtros por texto, por tipo de ação e por usuário.

---

## Gestão de Usuários

- Dois papéis: **Administrador** e **Voluntário** (`UserRole = "admin" | "voluntario"`).
- A aba Usuários (admin only) lista as contas e permite promover/rebaixar papéis e excluir usuários.
- Regras na camada de dados (`storage.ts`):
  - O admin padrão (`admin@ama.org`) não pode ser rebaixado nem excluído.
  - A senha nunca é exposta para a interface (`AppUser` não inclui `password`).

---

## Notificações (sino no header)

`NotificationBell.tsx` agrega alertas de produtos em três grupos, com link direto para a aba de estoque:

| Alerta | Critério |
|---|---|
| Vencido | `status === "expired"` |
| Vence em breve | `status === "critical"` ("Vence hoje" / "Vence em Xd") |
| Estoque baixo | `lowStock === true` (exibe `quantidade/minStock un.`) |

---

## Persistência (localStorage)

### Chaves

| Chave | Conteúdo |
|---|---|
| `ama_products` | Array de produtos (campos armazenados, sem os calculados) |
| `ama_next_id` | Contador incremental de IDs de produto |
| `ama_transactions` | Array de `Transaction[]` |
| `ama_next_tx_id` | Contador de IDs de transação |
| `ama_movements` | Array de `StockMovement[]` (entradas e saídas de estoque) |
| `ama_next_movement_id` | Contador de IDs de movimentação |
| `ama_users` | Array de `{ email, password, role, createdAt }[]` |
| `ama_activities` | Array de `Activity[]` (histórico, máx. 500) |
| `ama_next_activity_id` | Contador de IDs do histórico |
| `ama_seed_version` | String com a versão atual do seed (ex: `"v7"`) |
| `token` | Email do usuário logado (sessão) |

### Migração de Seed

O arquivo `storage.ts` define `SEED_VERSION` (atualmente `"v7"`). A função `migrateSeedIfNeeded()` é chamada na inicialização do módulo:

- Se a versão armazenada difere de `SEED_VERSION`, limpa o `localStorage` **preservando usuários e o histórico de alterações** e reinsere os dados de seed.
- Isso garante dados frescos ao atualizar o seed durante o desenvolvimento sem perder contas criadas.

### Dados de Seed

- **47 produtos**: perecíveis com datas variadas (alguns vencidos, críticos, em atenção, seguros) + itens de doação sem validade (roupas, calçados, eletrônicos, brinquedos, móveis, etc.)
- **32 transações**: de janeiro a maio de 2026, cobrindo receitas de eventos e parcerias, despesas operacionais e doações
- **6 movimentações** históricas de exemplo (entradas e saídas de maio/2026)
- **8 usuários**: o admin padrão + 7 contas de exemplo (admins e voluntários)

---

## Hooks

### `useProducts.ts`
Gerencia o estado do módulo de estoque: lista filtrada/ordenada com paginação ("mostrar mais"), formulário com validação por campo (`fieldErrors`), filtros (`searchQuery`, `statusFilter`, `categoryFilter`, `sortOption`), dados do dashboard e exclusão com confirmação (`requestDeleteProduct` → `confirmDeleteProduct`).

### `useFinance.ts`
Gerencia o estado do módulo financeiro: `transactions`, `summary` (`FinanceSummary` via `useMemo`), formulário de nova transação (zera `category` ao mudar o tipo) e operações de adicionar/remover.

### `useMovements.ts`
Gerencia o estado da movimentação de estoque: lista de movimentações, formulário (tipo, produto, quantidade, motivo, parte envolvida) e operações de criar/remover com ajuste automático do estoque.

### `useActivities.ts`
Gerencia o estado do histórico: registros filtrados (mais recente primeiro), lista de usuários para o filtro, filtros (`search`, `actionFilter`, `userFilter`) e `refresh`.

### `useUsers.ts`
Gerencia o estado da gestão de usuários: lista de contas, troca de papel e exclusão (respeitando as proteções do admin padrão).

---

## Design System

### Paleta de Cores

| Uso | Cor |
|---|---|
| Primária / header | `blue-700` (#1d4ed8) |
| Acento / destaques | `amber-400` (#fbbf24) |
| Fundo da aplicação | `slate-200` |
| Bordas padrão | `blue-100` |
| Texto principal | `gray-900` |
| Texto secundário | `gray-400/500` |
| Status: vencido | `red-400/500` |
| Status: crítico | `orange-400/500` |
| Status: atenção | `amber-400/500` |
| Status: seguro | `green-400/500` |

### Padrões Visuais

- Cards: `rounded-2xl` + `border border-blue-100` + `shadow-sm`
- Faixas superiores coloridas (`h-1` ou `h-1.5`) como identificadores visuais
- Botões primários: `bg-blue-700 hover:bg-blue-800 text-white rounded-xl`
- Animações de entrada: `motion.div` com `opacity: 0→1` + `y: 20→0`
- Aba ativa: pílula âmbar animada com `layoutId` (Framer Motion)
- Navegação: abas no header em telas largas (`xl+`), `BottomNav` fixa no mobile

---

## Scripts

```bash
npm run dev       # Servidor de desenvolvimento (porta 5173)
npm run build     # Type-check (tsc -b) + build de produção em /dist
npm run preview   # Preview do build de produção
npm run lint      # ESLint
```

---

## Licença

Uso interno — AMA Amigos Mãos Abertas.
