# AMA — Sistema de Gestão de Estoque

Sistema de controle de estoque e financeiro desenvolvido para a ONG **Amigos Mãos Abertas (AMA)**, uma organização solidária que distribui alimentos, roupas, medicamentos e outros itens para comunidades carentes.

---

## Visão Geral

A aplicação oferece:

- **Visão geral consolidada**: dashboard inicial que cruza estoque, finanças e atividades numa só tela
- **Gestão de produtos**: cadastro, edição, exclusão e busca com filtros avançados
- **Movimentação de estoque**: entradas e saídas que ajustam a quantidade do produto automaticamente
- **Controle financeiro**: caixa, receitas, despesas e doações com gráficos visuais
- **Relatórios e exportação**: estoque, financeiro e movimentações em CSV (Excel) ou PDF (impressão)
- **Gestão de usuários e papéis**: administradores e voluntários, com aba restrita a administradores
- **Autenticação**: login e cadastro de usuários com persistência local (com botão de mostrar/ocultar senha)
- **Histórico de alterações**: auditoria de quem entrou, quem saiu e o que foi cadastrado, editado ou removido
- **Indicadores de status**: vencimento de produtos com alertas por prazo (vencido, crítico, atenção, seguro)
- **UX**: notificações (toasts), modais de confirmação e estados de vazio reutilizáveis

> **Divisão de trabalho:** veja [`TAREFAS.md`](./TAREFAS.md) para a organização das 8 frentes da equipe.

---

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Framework de UI |
| TypeScript | 5.x | Tipagem estática |
| Vite | 8.x | Bundler e dev server |
| Tailwind CSS | 4.3 | Estilização utility-first |
| Framer Motion | 12 | Animações e transições |
| React Router DOM | 7 | Roteamento SPA |
| Lucide React | latest | Ícones |

> **Persistência**: 100% via `localStorage` — sem backend, sem banco de dados.

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
cd sistema-estoque
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

> Esse usuário é sempre recriado se removido, garantindo acesso permanente.

---

## Estrutura de Pastas

```
sistema-estoque/
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ActivityLog.tsx     # Histórico de alterações (linha do tempo + filtros)
│   │   ├── BudgetPanel.tsx     # Painel financeiro (gráficos + transações)
│   │   ├── Dashboard.tsx       # Cards de indicadores do estoque
│   │   ├── ProductCard.tsx     # Card individual de produto
│   │   ├── ProductFilters.tsx  # Barra de busca e filtros
│   │   ├── ProductForm.tsx     # Formulário de cadastro/edição de produto
│   │   └── ProductList.tsx     # Grade de cards de produtos
│   ├── contexts/
│   │   └── AuthContext.tsx     # Contexto de autenticação global (registra login/logout)
│   ├── hooks/
│   │   ├── useActivities.ts    # Estado e filtros do histórico de alterações
│   │   ├── useFinance.ts       # Estado e lógica do módulo financeiro
│   │   └── useProducts.ts      # Estado e lógica do módulo de produtos
│   ├── lib/
│   │   ├── productUtils.ts     # Utilitários: status, validade, perecíveis
│   │   └── storage.ts          # Toda a persistência localStorage + seeds + log de atividades
│   ├── pages/
│   │   ├── Home.tsx            # Página principal (tabs: Estoque / Financeiro / Histórico)
│   │   ├── Login.tsx           # Tela de login com ilustração SVG
│   │   └── Register.tsx        # Tela de cadastro de usuário
│   ├── types/
│   │   ├── activity.ts         # Tipos do histórico (Activity, FieldChange)
│   │   ├── finance.ts          # Tipos do módulo financeiro
│   │   └── product.ts          # Tipo Product e enums de status
│   ├── App.tsx                 # Rotas e proteção de autenticação
│   └── main.tsx                # Entry point React
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.app.json
└── vite.config.ts
```

---

## Arquitetura

### Fluxo de Dados

```
localStorage
    ↕
storage.ts (CRUD + seeds)
    ↕
useProducts.ts / useFinance.ts / useActivities.ts (hooks de estado)
    ↕
Home.tsx (orquestra abas)
    ↕
Componentes visuais (Dashboard, BudgetPanel, ProductCard...)
```

### Proteção de Rotas

`App.tsx` usa `AuthContext` para redirecionar usuários não autenticados para `/login`. Rotas protegidas:

- `/` → `Home` (requer login — abas Estoque, Financeiro e Histórico)
- `/login` → `Login` (pública)
- `/register` → `Register` (pública)

---

## Módulo de Produtos

### Tipo `Product`

```typescript
type Product = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  expirationDate: string;   // "YYYY-MM-DD" ou "" para não perecíveis
  status: "safe" | "attention" | "critical" | "expired";
  riskValue: number;        // quantity * unitCost para produtos em risco
  isDonation: boolean;      // true = custo zero, badge "Doação"
};
```

### Categorias e Perecibilidade

Categorias perecíveis (exigem data de validade):

- Alimentos, Bebidas, Higiene e Limpeza, Medicamentos

Categorias não perecíveis (campo de validade oculto no formulário):

- Roupas, Calçados, Utensílios Domésticos, Brinquedos, Materiais Escolares, Outros

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

Calculado para produtos com status `critical` ou `expired`:

```
riskValue = quantity × unitCost
```

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
- **`totalReceitas`**: soma de transações do tipo `receita`
- **`totalDespesas`**: soma de transações do tipo `despesa`
- **`totalDoacoes`**: soma de transações do tipo `doacao`
- **`monthlyFlow`**: entradas/saídas/doações dos últimos 6 meses (para o gráfico de barras)
- **`expensesByCategory`**: despesas agrupadas por categoria (para o gráfico de pizza)
- **`recentTransactions`**: últimas 10 transações ordenadas por data

### Categorias de Transação

```
Receita:  Evento, Parceria, Subvenção, Venda de Itens, Outros
Despesa:  Transporte, Alimentação, Aluguel, Materiais, Serviços, Outros
Doação:   Alimentos, Roupas, Medicamentos, Higiene, Brinquedos, Dinheiro, Outros
```

### Gráficos (SVG nativos)

- **Gráfico de Barras**: fluxo mensal dos últimos 6 meses — azul (entradas), vermelho (saídas), âmbar (doações)
- **Gráfico de Pizza (donut)**: distribuição de despesas por categoria, com arcos SVG calculados manualmente

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
  entity: "produto" | "movimentação" | "sessão" | "usuário";
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
| `create` / `delete` (movimentação) | `storage.ts` | "removeu movimentação Compra de alimentos" |

Em edições de produto, `diffProduct()` compara o estado anterior com o novo e gera uma lista de `FieldChange` (`{ label, from, to }`), exibida na interface como `Quantidade: 48 → 50`.

### Como funciona

- Todas as funções de mutação em `storage.ts` chamam `logActivity()`; `logLogin()` / `logLogout()` são acionadas pelo `AuthContext`.
- Os registros ficam em `localStorage` (`ama_activities`), limitados aos **500 mais recentes** (`ACTIVITY_CAP`).
- `ActivityLog.tsx` exibe uma linha do tempo agrupada por dia, com filtros por texto, por tipo de ação e por usuário.

---

## Persistência (localStorage)

### Chaves

| Chave | Conteúdo |
|---|---|
| `ama_products` | Array de `Product[]` |
| `ama_users` | Array de `{ email, password, role, createdAt }[]` |
| `ama_transactions` | Array de `Transaction[]` |
| `ama_movements` | Array de `StockMovement[]` (entradas e saídas de estoque) |
| `ama_activities` | Array de `Activity[]` (histórico de alterações, máx. 500) |
| `ama_next_activity_id` | Contador incremental de IDs do histórico |
| `ama_seed_version` | String com a versão atual do seed (ex: `"v3"`) |

### Migração de Seed

O arquivo `storage.ts` define `SEED_VERSION = "v3"`. A função `migrateSeedIfNeeded()` é chamada na inicialização do módulo:

- Se a versão armazenada difere de `SEED_VERSION`, apaga produtos e transações (preserva usuários **e o histórico de alterações**) e reinsere os dados de seed.
- Isso garante dados frescos ao atualizar o seed durante o desenvolvimento sem perder contas criadas.

### Dados de Seed

- **47 produtos**: perecíveis com datas variadas (alguns vencidos, críticos, em atenção, seguros) + itens de doação sem validade (roupas, calçados, brinquedos, etc.)
- **32 transações**: de janeiro a maio de 2026, cobrindo receitas de eventos e parcerias, despesas operacionais e doações recebidas em dinheiro e espécie

---

## Componentes

### `Dashboard.tsx`
Cards de indicadores no topo da aba de estoque. O card "Total de Produtos" é o hero card com fundo `bg-blue-700`. Os demais cards usam borda superior colorida por status.

### `ProductCard.tsx`
Card individual de produto com:
- Barra superior colorida por status (ou azul para doações)
- Badge de status ou "Doação"
- Grid 2×2 com quantidade e custo unitário
- Linha de validade + valor em risco
- Botões de editar (azul) e excluir (vermelho)

### `ProductForm.tsx`
Formulário de cadastro/edição com campos dinâmicos:
- `unitCost` ocultado quando `isDonation = true`
- `expirationDate` ocultado quando categoria não é perecível
- Animações com `AnimatePresence` + `motion.div` (width + opacity)

### `ProductFilters.tsx`
Barra de filtros com busca por texto, filtro por categoria, filtro por status e ordenação.

### `BudgetPanel.tsx`
Painel financeiro completo:
- Card hero de saldo (azul para positivo, vermelho para negativo)
- Cards de receitas, despesas e doações
- Gráfico de barras (fluxo mensal)
- Gráfico de pizza (despesas por categoria)
- Lista de transações recentes com hover-delete
- Formulário de nova transação

### `Login.tsx`
Tela de login split-screen:
- Painel esquerdo: `bg-blue-700` com ilustração SVG de solidariedade (3 figuras unidas com corações âmbar)
- Painel direito: formulário com card branco e faixa gradiente no topo
- Botão de mostrar/ocultar senha (ícone de olho `Eye`/`EyeOff`) — mesmo recurso disponível em `Register.tsx`

### `ActivityLog.tsx`
Histórico de alterações:
- Linha do tempo agrupada por dia (Hoje / Ontem / data), do mais recente para o mais antigo
- Ícone e cor por tipo de ação (entrada, saída, inclusão, edição, remoção, cadastro)
- Alterações de edição exibidas campo a campo no formato `de → para`
- Filtros por busca livre, por tipo de ação e por usuário

---

## Hooks

### `useProducts.ts`
Gerencia o estado do módulo de estoque:
- `products`: lista filtrada e ordenada
- `formData`, `editingId`, `showForm`: controle do formulário
- `searchQuery`, `statusFilter`, `categoryFilter`, `sortOption`: filtros
- `handleSubmit`, `handleEdit`, `handleDelete`: operações CRUD
- `handleInputChange`: limpa `expirationDate` ao mudar para categoria não perecível

### `useFinance.ts`
Gerencia o estado do módulo financeiro:
- `transactions`: todas as transações
- `summary`: `FinanceSummary` calculado via `useMemo`
- `form`: estado do formulário de nova transação
- `handleInputChange`: zera `category` ao mudar o tipo de transação
- `handleSubmit`, `handleDelete`: adicionar/remover transações

### `useActivities.ts`
Gerencia o estado do histórico de alterações:
- `activities`: registros já filtrados (do mais recente para o mais antigo)
- `users`: lista de usuários presentes no histórico (para o filtro)
- `search`, `actionFilter`, `userFilter`: filtros aplicados
- `refresh`: relê os registros do `localStorage`

---

## Design System

### Paleta de Cores

| Uso | Cor |
|---|---|
| Primária / headers | `blue-700` (#1d4ed8) |
| Acento / destaques | `amber-400` (#fbbf24) |
| Fundo da aplicação | `blue-50/40` |
| Bordas padrão | `blue-100` |
| Texto principal | `gray-900` |
| Texto secundário | `gray-400` |
| Status: vencido | `red-400/500` |
| Status: crítico | `orange-400/500` |
| Status: atenção | `amber-400/500` |
| Status: seguro | `green-400/500` |

### Padrões Visuais

- Cards: `rounded-2xl` + `border border-blue-100` + `shadow-sm`
- Faixas superiores coloridas (`h-1` ou `h-1.5`) como identificadores visuais
- Botões primários: `bg-blue-700 hover:bg-blue-800 text-white rounded-xl`
- Animações de entrada: `motion.div` com `opacity: 0→1` + `y: 20→0`
- Hover em cards: `whileHover={{ y: -3 }}` com `transition-shadow`

---

## Scripts

```bash
npm run dev       # Servidor de desenvolvimento (porta 5173)
npm run build     # Build de produção em /dist
npm run preview   # Preview do build de produção
npm run lint      # ESLint
```

---

## Licença

Uso interno — AMA Amigos Mãos Abertas.
