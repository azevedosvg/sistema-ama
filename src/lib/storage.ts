/* ============================================================================
 * 🎤 APRESENTAÇÃO · ARQUIVO COMPARTILHADO — storage.ts (a camada de dados)
 * Este é o arquivo-estrela do INTEGRANTE 9, mas QUATRO integrantes falam aqui.
 * Mapa de quem apresenta cada trecho (procure os marcadores [INT. x · PASSO y]):
 *
 *  · INTEGRANTE 9 — Infraestrutura (dono do arquivo):
 *      PASSO 2: const KEYS — o "banco de dados" no localStorage.
 *      PASSO 3: readRaw / writeRaw / nextId / createProduct — o padrão CRUD.
 *      PASSO 4: SEED_VERSION / migrateSeedIfNeeded / PRODUCT_SEED /
 *               TRANSACTION_SEED — dados de exemplo e migração.
 *
 *  · INTEGRANTE 5 — Histórico & Auditoria:
 *      PASSO 2: logActivity / logLogin / logLogout / diffProduct /
 *               getCurrentUser / ACTIVITY_CAP — o registro automático.
 *
 *  · INTEGRANTE 4 — Movimentação de Estoque:
 *      PASSO 3: createMovement / adjustProductStock / deleteMovement —
 *               o ajuste automático do estoque ("o pulo do gato").
 *
 *  · INTEGRANTE 7 — Gestão de Usuários:
 *      PASSO 3: getUsers / updateUserRole / deleteUser — as regras na
 *               camada de dados (admin protegido, senha nunca exposta).
 * ========================================================================== */
import type { Product } from "../types/product";
import type { Transaction } from "../types/finance";
import type { Activity, ActivityEntity, FieldChange } from "../types/activity";
import type { StockMovement } from "../types/movement";
import type { AppUser, UserRole } from "../types/user";
import { enrich } from "./productUtils";

type StoredProduct = Omit<Product, "status" | "daysToExpire" | "riskValue" | "lowStock">;
type User = { email: string; password: string; role: UserRole; createdAt: string };

// [INT. 9 · PASSO 4] Versão do seed: quando muda, os dados de exemplo são recarregados.
const SEED_VERSION = "v7";

// [INT. 9 · PASSO 2] O "banco de dados": cada tipo de dado tem sua chave no
// localStorage. Mostre no DevTools (F12 → Application → Local Storage).
const KEYS = {
  products: "ama_products",
  nextId: "ama_next_id",
  transactions: "ama_transactions",
  nextTxId: "ama_next_tx_id",
  movements: "ama_movements",
  nextMovementId: "ama_next_movement_id",
  users: "ama_users",
  seedVersion: "ama_seed_version",
  activities: "ama_activities",
  nextActivityId: "ama_next_activity_id",
};

// [INT. 9 · PASSO 4] A "parte esperta": quando a SEED_VERSION muda, recarrega
// os dados de exemplo PRESERVANDO as contas de usuário e o histórico.
// 🗣️ "Se eu atualizo os dados de exemplo, o sistema recarrega só eles, sem
// apagar os usuários nem o histórico que já existiam."
function migrateSeedIfNeeded() {
  if (localStorage.getItem(KEYS.seedVersion) === SEED_VERSION) return;
  const users = localStorage.getItem(KEYS.users);
  const activities = localStorage.getItem(KEYS.activities);
  const nextActivityId = localStorage.getItem(KEYS.nextActivityId);
  localStorage.clear();
  if (users) localStorage.setItem(KEYS.users, users);
  if (activities) localStorage.setItem(KEYS.activities, activities);
  if (nextActivityId) localStorage.setItem(KEYS.nextActivityId, nextActivityId);
  localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
}

migrateSeedIfNeeded();

// ─── Activity Log (Histórico) ───────────────────────────────────────────────────
// [INT. 5 · PASSO 2] Daqui até diffProduct é o coração do módulo de auditoria.

// [INT. 5 · PASSO 2] Limite de 500 registros — cite na pergunta "o histórico
// cresce para sempre?": não, os mais antigos são descartados.
const ACTIVITY_CAP = 500; // mantém apenas os registros mais recentes

// [INT. 5 · PASSO 2] O "quem fez": o token guardado no login é o próprio email.
function getCurrentUser(): string {
  return localStorage.getItem("token") || "Sistema";
}

function nextActivityId(): number {
  const id = parseInt(localStorage.getItem(KEYS.nextActivityId) ?? "1");
  localStorage.setItem(KEYS.nextActivityId, String(id + 1));
  return id;
}

function readActivities(): Activity[] {
  return JSON.parse(localStorage.getItem(KEYS.activities) ?? "[]") as Activity[];
}

export function getActivities(): Activity[] {
  return readActivities().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

type LogInput = {
  action: Activity["action"];
  entity: ActivityEntity;
  target: string;
  changes?: FieldChange[];
  user?: string;
};

// [INT. 5 · PASSO 2] O PONTO-CHAVE da sua fala: esta função é chamada DE DENTRO
// de cada operação do sistema (criar produto, transação, movimentação...).
// Ninguém precisa lembrar de "anotar" — o registro é automático.
// 🗣️ "O segredo é que o registro não depende da tela: ele acontece dentro da
// própria camada de dados."
export function logActivity(input: LogInput): void {
  const activity: Activity = {
    id: nextActivityId(),
    timestamp: new Date().toISOString(),
    user: input.user ?? getCurrentUser(),
    action: input.action,
    entity: input.entity,
    target: input.target,
    changes: input.changes,
  };
  const next = [activity, ...readActivities()].slice(0, ACTIVITY_CAP);
  localStorage.setItem(KEYS.activities, JSON.stringify(next));
}

// [INT. 5 · PASSO 2] Chamadas pelo login/logout do Integrante 1 (AuthContext).
export function logLogin(email: string): void {
  logActivity({ action: "login", entity: "sessão", target: email, user: email });
}

export function logLogout(email: string): void {
  logActivity({ action: "logout", entity: "sessão", target: email, user: email });
}

// Diferença campo a campo entre dois produtos (para registrar o que foi mexido)
const PRODUCT_FIELD_LABELS: Record<keyof StoredProduct, string> = {
  id: "ID",
  name: "Nome",
  category: "Categoria",
  quantity: "Quantidade",
  unitCost: "Custo unitário",
  expirationDate: "Validade",
  isDonation: "Doação",
  minStock: "Estoque mínimo",
};

function fmtProductValue(field: keyof StoredProduct, value: unknown): string {
  if (field === "unitCost") return `R$ ${Number(value).toFixed(2)}`;
  if (field === "isDonation") return value ? "Sim" : "Não";
  if (field === "expirationDate") return value ? String(value) : "—";
  if (field === "minStock") return Number(value) > 0 ? String(value) : "—";
  return String(value);
}

// [INT. 5 · PASSO 2] Compara o produto antes e depois e gera a lista de
// mudanças campo a campo (ex.: "Quantidade: 48 → 50") exibida no histórico.
function diffProduct(prev: StoredProduct, next: StoredProduct): FieldChange[] {
  const fields: (keyof StoredProduct)[] = [
    "name", "category", "quantity", "unitCost", "expirationDate", "isDonation", "minStock",
  ];
  const changes: FieldChange[] = [];
  for (const f of fields) {
    if (prev[f] !== next[f]) {
      changes.push({
        field: f,
        label: PRODUCT_FIELD_LABELS[f],
        from: fmtProductValue(f, prev[f]),
        to: fmtProductValue(f, next[f]),
      });
    }
  }
  return changes;
}

// ─── Product Seed ─────────────────────────────────────────────────────────────
// [INT. 9 · PASSO 4] Os seeds: 47 produtos e 32 transações já preenchidos,
// para o sistema nunca abrir vazio na demonstração.

// Ponto de reposição padrão para os dados de exemplo: ~25% da quantidade inicial,
// com piso de 6 unidades — assim itens com pouco estoque já aparecem como "estoque baixo".
function defaultMinStock(quantity: number): number {
  return Math.max(6, Math.round(quantity * 0.25));
}

const PRODUCT_SEED_BASE: Omit<StoredProduct, "minStock">[] = [
  // Alimentos — vencimentos variados (expired, critical, attention, safe)
  { id: 1,  name: "Leite Integral 1L",          category: "Alimentos",             quantity: 48,  unitCost: 4.89,  expirationDate: "2026-07-22", isDonation: false },
  { id: 2,  name: "Feijão Carioca 1kg",          category: "Alimentos",             quantity: 72,  unitCost: 9.50,  expirationDate: "2026-09-12", isDonation: false },
  { id: 3,  name: "Arroz Tipo 1 5kg",            category: "Alimentos",             quantity: 30,  unitCost: 29.90, expirationDate: "2027-04-10", isDonation: false },
  { id: 4,  name: "Macarrão Espaguete 500g",     category: "Alimentos",             quantity: 90,  unitCost: 4.20,  expirationDate: "2026-09-01", isDonation: false },
  { id: 5,  name: "Óleo de Soja 900ml",          category: "Alimentos",             quantity: 24,  unitCost: 7.80,  expirationDate: "2026-11-18", isDonation: false },
  { id: 6,  name: "Açúcar Cristal 2kg",          category: "Alimentos",             quantity: 36,  unitCost: 6.90,  expirationDate: "2027-02-14", isDonation: false },
  { id: 7,  name: "Farinha de Trigo 1kg",        category: "Alimentos",             quantity: 40,  unitCost: 5.40,  expirationDate: "2026-11-30", isDonation: false },
  { id: 8,  name: "Molho de Tomate 340g",        category: "Alimentos",             quantity: 18,  unitCost: 3.20,  expirationDate: "2026-06-13", isDonation: false },
  { id: 9,  name: "Sardinha em Lata 125g",       category: "Alimentos",             quantity: 38,  unitCost: 5.60,  expirationDate: "2028-03-01", isDonation: false },
  { id: 10, name: "Sal Refinado 1kg",            category: "Alimentos",             quantity: 12,  unitCost: 2.50,  expirationDate: "2026-05-10", isDonation: false },
  // Bebidas
  { id: 11, name: "Achocolatado em Pó 400g",     category: "Bebidas",               quantity: 18,  unitCost: 15.90, expirationDate: "2026-10-14", isDonation: false },
  { id: 12, name: "Leite em Pó Integral 400g",   category: "Bebidas",               quantity: 12,  unitCost: 19.90, expirationDate: "2026-09-28", isDonation: false },
  { id: 13, name: "Suco de Laranja 1L",          category: "Bebidas",               quantity: 24,  unitCost: 8.50,  expirationDate: "2026-07-15", isDonation: false },
  { id: 14, name: "Café Torrado e Moído 500g",   category: "Bebidas",               quantity: 20,  unitCost: 18.50, expirationDate: "2026-10-20", isDonation: false },
  // Higiene e Limpeza
  { id: 15, name: "Sabonete Antibacteriano",      category: "Higiene e Limpeza",     quantity: 120, unitCost: 2.90,  expirationDate: "2027-06-15", isDonation: false },
  { id: 16, name: "Pasta de Dente 90g",          category: "Higiene e Limpeza",     quantity: 60,  unitCost: 4.50,  expirationDate: "2027-03-28", isDonation: false },
  { id: 17, name: "Fraldas Descartáveis M (p/ 40)", category: "Higiene e Limpeza", quantity: 15,  unitCost: 44.90, expirationDate: "2028-06-01", isDonation: false },
  { id: 18, name: "Absorvente Noturno c/8",      category: "Higiene e Limpeza",     quantity: 30,  unitCost: 6.80,  expirationDate: "2028-01-01", isDonation: false },
  { id: 19, name: "Shampoo Infantil 200ml",      category: "Higiene e Limpeza",     quantity: 25,  unitCost: 8.90,  expirationDate: "2027-09-10", isDonation: false },
  { id: 20, name: "Desinfetante 500ml",          category: "Higiene e Limpeza",     quantity: 40,  unitCost: 4.20,  expirationDate: "2027-11-30", isDonation: false },
  // Medicamentos
  { id: 21, name: "Dipirona 500mg cx 10cp",      category: "Medicamentos",          quantity: 20,  unitCost: 8.90,  expirationDate: "2026-11-22", isDonation: false },
  { id: 22, name: "Vitamina C 1g Efervescente",  category: "Medicamentos",          quantity: 30,  unitCost: 13.50, expirationDate: "2027-08-01", isDonation: false },
  { id: 23, name: "Pomada Cicatrizante 30g",     category: "Medicamentos",          quantity: 12,  unitCost: 16.90, expirationDate: "2027-01-15", isDonation: false },
  { id: 24, name: "Soro Fisiológico 250ml",      category: "Medicamentos",          quantity: 18,  unitCost: 5.50,  expirationDate: "2026-12-10", isDonation: false },
  // Roupas — doação
  { id: 25, name: "Camiseta Infantil 4-6 anos",  category: "Roupas",                quantity: 34,  unitCost: 0, expirationDate: "", isDonation: true },
  { id: 26, name: "Calça Jeans Masculina G",     category: "Roupas",                quantity: 12,  unitCost: 0, expirationDate: "", isDonation: true },
  { id: 27, name: "Agasalho Infantil M",         category: "Roupas",                quantity: 18,  unitCost: 0, expirationDate: "", isDonation: true },
  { id: 28, name: "Vestido Feminino M",          category: "Roupas",                quantity: 9,   unitCost: 0, expirationDate: "", isDonation: true },
  { id: 29, name: "Blusa Feminina P",            category: "Roupas",                quantity: 22,  unitCost: 0, expirationDate: "", isDonation: true },
  // Calçados — doação
  { id: 30, name: "Tênis Infantil nº 30",        category: "Calçados",              quantity: 8,   unitCost: 0, expirationDate: "", isDonation: true },
  { id: 31, name: "Sandália Feminina nº 37",     category: "Calçados",              quantity: 10,  unitCost: 0, expirationDate: "", isDonation: true },
  { id: 32, name: "Sapato Social Masculino 42",  category: "Calçados",              quantity: 4,   unitCost: 0, expirationDate: "", isDonation: true },
  // Eletrônicos — doação
  { id: 33, name: "Tablet Samsung 7 pol.",       category: "Eletrônicos",           quantity: 3,   unitCost: 0, expirationDate: "", isDonation: true },
  { id: 34, name: "Notebook Dell i3 8GB",        category: "Eletrônicos",           quantity: 2,   unitCost: 0, expirationDate: "", isDonation: true },
  { id: 35, name: "Smartphone Motorola 64GB",    category: "Eletrônicos",           quantity: 2,   unitCost: 0, expirationDate: "", isDonation: true },
  // Brinquedos — doação
  { id: 36, name: "Jogo de Blocos de Montar",    category: "Brinquedos",            quantity: 15,  unitCost: 0, expirationDate: "", isDonation: true },
  { id: 37, name: "Bicicleta Infantil aro 16",   category: "Brinquedos",            quantity: 3,   unitCost: 0, expirationDate: "", isDonation: true },
  { id: 38, name: "Boneca de Pano Artesanal",    category: "Brinquedos",            quantity: 20,  unitCost: 0, expirationDate: "", isDonation: true },
  // Material Escolar — doação
  { id: 39, name: "Mochila Escolar Infantil",    category: "Material Escolar",      quantity: 14,  unitCost: 0, expirationDate: "", isDonation: true },
  { id: 40, name: "Kit Lápis de Cor 12un",       category: "Material Escolar",      quantity: 45,  unitCost: 0, expirationDate: "", isDonation: true },
  { id: 41, name: "Caderno 96 folhas",           category: "Material Escolar",      quantity: 60,  unitCost: 0, expirationDate: "", isDonation: true },
  { id: 42, name: "Kit Canetas Coloridas",       category: "Material Escolar",      quantity: 28,  unitCost: 0, expirationDate: "", isDonation: true },
  // Utensílios Domésticos — doação
  { id: 43, name: "Panela Antiaderente 20cm",    category: "Utensílios Domésticos", quantity: 6,   unitCost: 0, expirationDate: "", isDonation: true },
  { id: 44, name: "Conjunto de Talheres 24p",    category: "Utensílios Domésticos", quantity: 5,   unitCost: 0, expirationDate: "", isDonation: true },
  { id: 45, name: "Cobertor Casal",              category: "Utensílios Domésticos", quantity: 11,  unitCost: 0, expirationDate: "", isDonation: true },
  // Móveis — doação
  { id: 46, name: "Cadeira de Escritório",       category: "Móveis",                quantity: 2,   unitCost: 0, expirationDate: "", isDonation: true },
  { id: 47, name: "Mesa de Estudos Infantil",    category: "Móveis",                quantity: 1,   unitCost: 0, expirationDate: "", isDonation: true },
];

const PRODUCT_SEED: StoredProduct[] = PRODUCT_SEED_BASE.map((p) => ({
  ...p,
  minStock: defaultMinStock(p.quantity),
}));

// ─── Transaction Seed ─────────────────────────────────────────────────────────

const TRANSACTION_SEED: Transaction[] = [
  // Janeiro 2026
  { id: 1,  type: "receita",  amount: 420.00,  description: "Evento de Ano Novo — Jantar Beneficente",      category: "Evento de Arrecadação",  date: "2026-01-08" },
  { id: 2,  type: "doacao",   amount: 230.00,  description: "Doação Empresa Construtora Leal",              category: "Empresa",                date: "2026-01-12" },
  { id: 3,  type: "despesa",  amount: 210.00,  description: "Compra de alimentos básicos — Atacadão",       category: "Compra de Estoque",       date: "2026-01-14" },
  { id: 4,  type: "despesa",  amount: 85.00,   description: "Compra itens de higiene — Distribuidora",      category: "Compra de Estoque",       date: "2026-01-16" },
  { id: 5,  type: "despesa",  amount: 30.00,   description: "Frete entrega de doações — Motoboy",           category: "Logística e Transporte",  date: "2026-01-20" },
  { id: 6,  type: "receita",  amount: 120.00,  description: "Mensalidades voluntários jan/26",              category: "Mensalidades",           date: "2026-01-31" },
  // Fevereiro 2026
  { id: 7,  type: "doacao",   amount: 140.00,  description: "Campanha de Carnaval — vaquinha online",       category: "Campanha Online",        date: "2026-02-05" },
  { id: 8,  type: "doacao",   amount: 60.00,   description: "Doação Srª Maria Aparecida",                   category: "Pessoa Física",          date: "2026-02-10" },
  { id: 9,  type: "despesa",  amount: 175.00,  description: "Reposição de estoque — alimentos e bebidas",   category: "Compra de Estoque",       date: "2026-02-12" },
  { id: 10, type: "despesa",  amount: 78.00,   description: "Conta de luz sede fev/26",                     category: "Administrativo",         date: "2026-02-15" },
  { id: 11, type: "receita",  amount: 120.00,  description: "Mensalidades voluntários fev/26",              category: "Mensalidades",           date: "2026-02-28" },
  { id: 12, type: "despesa",  amount: 48.00,   description: "Material de escritório e limpeza sede",        category: "Serviços Gerais",        date: "2026-02-28" },
  // Março 2026
  { id: 13, type: "receita",  amount: 510.00,  description: "Bazar Solidário — 1ª Edição",                  category: "Evento de Arrecadação",  date: "2026-03-07" },
  { id: 14, type: "doacao",   amount: 300.00,  description: "Doação Supermercado Família",                  category: "Empresa",                date: "2026-03-10" },
  { id: 15, type: "despesa",  amount: 260.00,  description: "Compra alimentos — feira atacado março",       category: "Compra de Estoque",       date: "2026-03-11" },
  { id: 16, type: "despesa",  amount: 115.00,  description: "Compra medicamentos essenciais",               category: "Compra de Estoque",       date: "2026-03-13" },
  { id: 17, type: "despesa",  amount: 40.00,   description: "Transporte distribuição bairros",              category: "Logística e Transporte",  date: "2026-03-18" },
  { id: 18, type: "receita",  amount: 120.00,  description: "Mensalidades voluntários mar/26",              category: "Mensalidades",           date: "2026-03-31" },
  // Abril 2026
  { id: 19, type: "doacao",   amount: 75.00,   description: "Doação Sr. Carlos Mendes",                     category: "Pessoa Física",          date: "2026-04-03" },
  { id: 20, type: "doacao",   amount: 190.00,  description: "Campanha Páscoa Solidária — Instagram",        category: "Campanha Online",        date: "2026-04-14" },
  { id: 21, type: "despesa",  amount: 240.00,  description: "Compra de estoque — alimentos e higiene",      category: "Compra de Estoque",       date: "2026-04-15" },
  { id: 22, type: "despesa",  amount: 92.00,   description: "Conta de luz e água sede abr/26",              category: "Administrativo",         date: "2026-04-17" },
  { id: 23, type: "despesa",  amount: 55.00,   description: "Manutenção veículo de entregas",               category: "Logística e Transporte",  date: "2026-04-22" },
  { id: 24, type: "receita",  amount: 120.00,  description: "Mensalidades voluntários abr/26",              category: "Mensalidades",           date: "2026-04-30" },
  { id: 25, type: "receita",  amount: 280.00,  description: "Parceria Prefeitura Municipal — abr/26",       category: "Parceria Institucional", date: "2026-04-30" },
  // Maio 2026
  { id: 26, type: "receita",  amount: 620.00,  description: "Projeto Social Municipal — repasse mai/26",    category: "Projeto Social",         date: "2026-05-02" },
  { id: 27, type: "doacao",   amount: 210.00,  description: "Doação Empresa TechCare LTDA",                 category: "Empresa",                date: "2026-05-08" },
  { id: 28, type: "despesa",  amount: 310.00,  description: "Grande compra alimentos — Atacadão mai/26",    category: "Compra de Estoque",       date: "2026-05-09" },
  { id: 29, type: "despesa",  amount: 88.00,   description: "Reposição itens de higiene",                   category: "Compra de Estoque",       date: "2026-05-12" },
  { id: 30, type: "doacao",   amount: 50.00,   description: "Doação Srª Fernanda Lima",                     category: "Pessoa Física",          date: "2026-05-15" },
  { id: 31, type: "despesa",  amount: 35.00,   description: "Combustível entregas semana 3",                category: "Logística e Transporte",  date: "2026-05-20" },
  { id: 32, type: "receita",  amount: 120.00,  description: "Mensalidades voluntários mai/26",              category: "Mensalidades",           date: "2026-05-26" },
];

// ─── Products ─────────────────────────────────────────────────────────────────
// [INT. 9 · PASSO 3] O padrão CRUD que se repete para cada entidade:
// uma função para LER (readRaw), uma para GRAVAR (writeRaw) e um gerador de
// IDs incrementais (nextId). Produtos, transações, movimentações e usuários
// seguem todos este mesmo padrão.

function readRaw(): StoredProduct[] {
  const raw = localStorage.getItem(KEYS.products);
  if (raw) {
    // Garante minStock em produtos salvos antes da introdução do estoque mínimo
    return (JSON.parse(raw) as StoredProduct[]).map((p) => ({ ...p, minStock: p.minStock ?? 0 }));
  }
  localStorage.setItem(KEYS.products, JSON.stringify(PRODUCT_SEED));
  localStorage.setItem(KEYS.nextId, String(PRODUCT_SEED.length + 1));
  return PRODUCT_SEED;
}

function writeRaw(products: StoredProduct[]): void {
  localStorage.setItem(KEYS.products, JSON.stringify(products));
}

function nextId(): number {
  const id = parseInt(localStorage.getItem(KEYS.nextId) ?? "1");
  localStorage.setItem(KEYS.nextId, String(id + 1));
  return id;
}

export function getProducts(): Product[] {
  return readRaw().map(enrich);
}

// [INT. 9 · PASSO 3] Use createProduct como EXEMPLO do padrão: gera o ID,
// grava e registra a atividade — por isso a auditoria funciona pra tudo.
export function createProduct(data: Omit<StoredProduct, "id">): Product {
  const raw = readRaw();
  const product: StoredProduct = { id: nextId(), ...data };
  writeRaw([...raw, product]);
  logActivity({ action: "create", entity: "produto", target: product.name });
  return enrich(product);
}

export function updateProduct(id: number, data: Omit<StoredProduct, "id">): Product {
  const raw = readRaw();
  const prev = raw.find((p) => p.id === id);
  const next: StoredProduct = { id, ...data };
  writeRaw(raw.map((p) => (p.id === id ? next : p)));
  if (prev) {
    logActivity({
      action: "update",
      entity: "produto",
      target: next.name,
      changes: diffProduct(prev, next),
    });
  }
  return enrich(next);
}

export function deleteProduct(id: number): void {
  const raw = readRaw();
  const target = raw.find((p) => p.id === id);
  writeRaw(raw.filter((p) => p.id !== id));
  if (target) logActivity({ action: "delete", entity: "produto", target: target.name });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

function readTxRaw(): Transaction[] {
  const raw = localStorage.getItem(KEYS.transactions);
  if (raw) return JSON.parse(raw) as Transaction[];
  localStorage.setItem(KEYS.transactions, JSON.stringify(TRANSACTION_SEED));
  localStorage.setItem(KEYS.nextTxId, String(TRANSACTION_SEED.length + 1));
  return TRANSACTION_SEED;
}

function writeTxRaw(txs: Transaction[]): void {
  localStorage.setItem(KEYS.transactions, JSON.stringify(txs));
}

function nextTxId(): number {
  const id = parseInt(localStorage.getItem(KEYS.nextTxId) ?? "1");
  localStorage.setItem(KEYS.nextTxId, String(id + 1));
  return id;
}

export function getTransactions(): Transaction[] {
  return readTxRaw().sort((a, b) => b.date.localeCompare(a.date));
}

export function createTransaction(data: Omit<Transaction, "id">): Transaction {
  const txs = readTxRaw();
  const tx: Transaction = { id: nextTxId(), ...data };
  writeTxRaw([...txs, tx]);
  logActivity({ action: "create", entity: "movimentação", target: tx.description });
  return tx;
}

export function deleteTransaction(id: number): void {
  const txs = readTxRaw();
  const target = txs.find((t) => t.id === id);
  writeTxRaw(txs.filter((t) => t.id !== id));
  if (target) logActivity({ action: "delete", entity: "movimentação", target: target.description });
}

// ─── Stock Movements (Movimentação de estoque) ──────────────────────────────────
// [INT. 4 · PASSO 3] "O pulo do gato" do seu módulo está nas três funções
// abaixo: createMovement, adjustProductStock e deleteMovement (~2:00–3:00).

// Algumas movimentações históricas de exemplo (registros — não recalculam o estoque do seed)
const MOVEMENT_SEED: Omit<StockMovement, "user">[] = [
  { id: 1, productId: 1,  productName: "Leite Integral 1L",        type: "entrada", quantity: 24, reason: "Compra",            party: "Atacadão Central",            date: "2026-05-09" },
  { id: 2, productId: 2,  productName: "Feijão Carioca 1kg",       type: "entrada", quantity: 40, reason: "Doação recebida",    party: "Supermercado Família",        date: "2026-05-10" },
  { id: 3, productId: 1,  productName: "Leite Integral 1L",        type: "saida",   quantity: 12, reason: "Distribuição",       party: "Família Souza — Bairro Esperança", date: "2026-05-18" },
  { id: 4, productId: 25, productName: "Camiseta Infantil 4-6 anos", type: "saida", quantity: 10, reason: "Doação entregue",    party: "Creche Pequeno Príncipe",     date: "2026-05-20" },
  { id: 5, productId: 21, productName: "Dipirona 500mg cx 10cp",   type: "saida",   quantity: 5,  reason: "Distribuição",       party: "Posto de Saúde do bairro",    date: "2026-05-22" },
  { id: 6, productId: 4,  productName: "Macarrão Espaguete 500g",  type: "entrada", quantity: 30, reason: "Compra",            party: "Atacadão Central",            date: "2026-05-25" },
];

function readMovementsRaw(): StockMovement[] {
  const raw = localStorage.getItem(KEYS.movements);
  if (raw) return JSON.parse(raw) as StockMovement[];
  const seeded = MOVEMENT_SEED.map((m) => ({ ...m, user: "admin@ama.org" }));
  localStorage.setItem(KEYS.movements, JSON.stringify(seeded));
  localStorage.setItem(KEYS.nextMovementId, String(seeded.length + 1));
  return seeded;
}

function writeMovementsRaw(movements: StockMovement[]): void {
  localStorage.setItem(KEYS.movements, JSON.stringify(movements));
}

function nextMovementId(): number {
  const id = parseInt(localStorage.getItem(KEYS.nextMovementId) ?? "1");
  localStorage.setItem(KEYS.nextMovementId, String(id + 1));
  return id;
}

export function getMovements(): StockMovement[] {
  return readMovementsRaw().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}

// [INT. 4 · PASSO 3] Ajusta a quantidade do produto: +qty para entrada,
// -qty para saída — e o Math.max(0, …) garante que nunca fica negativo.
function adjustProductStock(productId: number, delta: number): void {
  const raw = readRaw();
  writeRaw(
    raw.map((p) =>
      p.id === productId ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p,
    ),
  );
}

// [INT. 4 · PASSO 3] Mostre que createMovement CHAMA adjustProductStock —
// o módulo não só anota a movimentação, ele realmente altera o estoque.
// 🗣️ "Entrada soma, saída subtrai."
export function createMovement(
  data: Omit<StockMovement, "id" | "user" | "productName">,
): StockMovement {
  const product = readRaw().find((p) => p.id === data.productId);
  const movement: StockMovement = {
    id: nextMovementId(),
    productName: product?.name ?? "Produto removido",
    user: getCurrentUser(),
    ...data,
  };
  writeMovementsRaw([movement, ...readMovementsRaw()]);
  adjustProductStock(data.productId, data.type === "entrada" ? data.quantity : -data.quantity);
  logActivity({
    action: "create",
    entity: "estoque",
    target: `${data.type === "entrada" ? "Entrada" : "Saída"} · ${movement.productName} (${data.quantity})`,
  });
  return movement;
}

// [INT. 4 · PASSO 3] Ao apagar uma movimentação, o efeito é REVERTIDO no
// estoque: uma saída apagada devolve as unidades.
export function deleteMovement(id: number): void {
  const movements = readMovementsRaw();
  const target = movements.find((m) => m.id === id);
  writeMovementsRaw(movements.filter((m) => m.id !== id));
  if (target) {
    // Reverte o efeito da movimentação no estoque
    adjustProductStock(target.productId, target.type === "entrada" ? -target.quantity : target.quantity);
    logActivity({
      action: "delete",
      entity: "estoque",
      target: `${target.type === "entrada" ? "Entrada" : "Saída"} · ${target.productName} (${target.quantity})`,
    });
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

const DEFAULT_ADMIN: User = {
  email: "admin@ama.org",
  password: "admin123",
  role: "admin",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const USER_SEED: User[] = [
  { email: "ana.voluntaria@ama.org",   password: "senha123", role: "voluntario", createdAt: "2026-01-15T09:00:00.000Z" },
  { email: "carlos.coord@ama.org",     password: "senha123", role: "voluntario", createdAt: "2026-02-03T10:30:00.000Z" },
  { email: "fernanda.gestora@ama.org", password: "senha123", role: "admin",      createdAt: "2026-02-20T08:00:00.000Z" },
  { email: "joao.voluntario@ama.org",  password: "senha123", role: "voluntario", createdAt: "2026-03-10T14:00:00.000Z" },
  { email: "lucia.admin@ama.org",      password: "senha123", role: "admin",      createdAt: "2026-04-01T11:00:00.000Z" },
  { email: "pedro.vol@ama.org",        password: "senha123", role: "voluntario", createdAt: "2026-04-18T09:15:00.000Z" },
  { email: "marcia.vol@ama.org",       password: "senha123", role: "voluntario", createdAt: "2026-05-05T16:00:00.000Z" },
];

const ALL_SEED_USERS = [DEFAULT_ADMIN, ...USER_SEED];

// Normaliza usuários antigos que não tinham papel/data de criação
function normalizeUser(u: Partial<User> & { email: string; password: string }): User {
  return {
    email: u.email,
    password: u.password,
    role: u.role ?? (u.email === DEFAULT_ADMIN.email ? "admin" : "voluntario"),
    createdAt: u.createdAt ?? new Date().toISOString(),
  };
}

function readUsers(): User[] {
  const stored = (JSON.parse(localStorage.getItem(KEYS.users) ?? "[]") as User[]).map(normalizeUser);
  const storedEmails = new Set(stored.map((u) => u.email));
  const missing = ALL_SEED_USERS.filter((u) => !storedEmails.has(u.email));
  if (missing.length > 0) {
    const merged = [...missing, ...stored];
    localStorage.setItem(KEYS.users, JSON.stringify(merged));
    return merged;
  }
  return stored;
}

function writeUsers(users: User[]): void {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

export function registerUser(email: string, password: string): "ok" | "exists" {
  const users = readUsers();
  if (users.some((u) => u.email === email)) return "exists";
  const user: User = { email, password, role: "voluntario", createdAt: new Date().toISOString() };
  writeUsers([...users, user]);
  logActivity({ action: "register", entity: "usuário", target: email, user: email });
  return "ok";
}

export function loginUser(email: string, password: string): boolean {
  return readUsers().some((u) => u.email === email && u.password === password);
}

// [INT. 7 · PASSO 3] Destaque: getUsers devolve os usuários SEM a senha —
// só e-mail, papel e data de criação. 🗣️ "Eu nunca exponho a senha."
export function getUsers(): AppUser[] {
  return readUsers()
    .map(({ email, role, createdAt }) => ({ email, role, createdAt }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getUserRole(email: string): UserRole {
  return readUsers().find((u) => u.email === email)?.role ?? "voluntario";
}

// [INT. 7 · PASSO 3] As regras na camada de dados: recusa mexer no admin
// padrão e registra toda mudança de papel no Histórico (Integrante 5).
export function updateUserRole(email: string, role: UserRole): void {
  if (email === DEFAULT_ADMIN.email) return; // o admin padrão não pode ser rebaixado
  const users = readUsers();
  const prev = users.find((u) => u.email === email);
  if (!prev || prev.role === role) return;
  writeUsers(users.map((u) => (u.email === email ? { ...u, role } : u)));
  logActivity({
    action: "update",
    entity: "usuário",
    target: email,
    changes: [{ field: "role", label: "Papel", from: prev.role, to: role }],
  });
}

// [INT. 7 · PASSO 3] Mesma proteção na exclusão: o admin padrão é permanente.
export function deleteUser(email: string): void {
  if (email === DEFAULT_ADMIN.email) return; // o admin padrão é permanente
  const users = readUsers();
  if (!users.some((u) => u.email === email)) return;
  writeUsers(users.filter((u) => u.email !== email));
  logActivity({ action: "delete", entity: "usuário", target: email });
}
