import type { Product } from "../types/product";
import type { Transaction } from "../types/finance";
import type { Activity, ActivityEntity, FieldChange } from "../types/activity";
import { enrich } from "./productUtils";

type StoredProduct = Omit<Product, "status" | "daysToExpire" | "riskValue">;
type User = { email: string; password: string };

const SEED_VERSION = "v3";

const KEYS = {
  products: "ama_products",
  nextId: "ama_next_id",
  transactions: "ama_transactions",
  nextTxId: "ama_next_tx_id",
  users: "ama_users",
  seedVersion: "ama_seed_version",
  activities: "ama_activities",
  nextActivityId: "ama_next_activity_id",
};

// Re-seed when SEED_VERSION changes, preserving user accounts and history
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

const ACTIVITY_CAP = 500; // mantém apenas os registros mais recentes

// O "token" guardado no login é o próprio email do usuário
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
};

function fmtProductValue(field: keyof StoredProduct, value: unknown): string {
  if (field === "unitCost") return `R$ ${Number(value).toFixed(2)}`;
  if (field === "isDonation") return value ? "Sim" : "Não";
  if (field === "expirationDate") return value ? String(value) : "—";
  return String(value);
}

function diffProduct(prev: StoredProduct, next: StoredProduct): FieldChange[] {
  const fields: (keyof StoredProduct)[] = [
    "name", "category", "quantity", "unitCost", "expirationDate", "isDonation",
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

const PRODUCT_SEED: StoredProduct[] = [
  // Alimentos — vencimentos variados (expired, critical, attention, safe)
  { id: 1,  name: "Leite Integral 1L",          category: "Alimentos",             quantity: 48,  unitCost: 4.89,  expirationDate: "2026-07-22", isDonation: false },
  { id: 2,  name: "Feijão Carioca 1kg",          category: "Alimentos",             quantity: 72,  unitCost: 9.50,  expirationDate: "2026-06-04", isDonation: false },
  { id: 3,  name: "Arroz Tipo 1 5kg",            category: "Alimentos",             quantity: 30,  unitCost: 29.90, expirationDate: "2027-04-10", isDonation: false },
  { id: 4,  name: "Macarrão Espaguete 500g",     category: "Alimentos",             quantity: 90,  unitCost: 4.20,  expirationDate: "2026-09-01", isDonation: false },
  { id: 5,  name: "Óleo de Soja 900ml",          category: "Alimentos",             quantity: 24,  unitCost: 7.80,  expirationDate: "2026-05-30", isDonation: false },
  { id: 6,  name: "Açúcar Cristal 2kg",          category: "Alimentos",             quantity: 36,  unitCost: 6.90,  expirationDate: "2027-02-14", isDonation: false },
  { id: 7,  name: "Farinha de Trigo 1kg",        category: "Alimentos",             quantity: 40,  unitCost: 5.40,  expirationDate: "2026-11-30", isDonation: false },
  { id: 8,  name: "Molho de Tomate 340g",        category: "Alimentos",             quantity: 55,  unitCost: 3.20,  expirationDate: "2026-05-20", isDonation: false },
  { id: 9,  name: "Sardinha em Lata 125g",       category: "Alimentos",             quantity: 38,  unitCost: 5.60,  expirationDate: "2028-03-01", isDonation: false },
  { id: 10, name: "Sal Refinado 1kg",            category: "Alimentos",             quantity: 50,  unitCost: 2.50,  expirationDate: "2028-12-31", isDonation: false },
  // Bebidas
  { id: 11, name: "Achocolatado em Pó 400g",     category: "Bebidas",               quantity: 18,  unitCost: 15.90, expirationDate: "2026-06-10", isDonation: false },
  { id: 12, name: "Leite em Pó Integral 400g",   category: "Bebidas",               quantity: 12,  unitCost: 19.90, expirationDate: "2026-06-01", isDonation: false },
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
  { id: 21, name: "Dipirona 500mg cx 10cp",      category: "Medicamentos",          quantity: 20,  unitCost: 8.90,  expirationDate: "2026-06-03", isDonation: false },
  { id: 22, name: "Vitamina C 1g Efervescente",  category: "Medicamentos",          quantity: 30,  unitCost: 13.50, expirationDate: "2027-08-01", isDonation: false },
  { id: 23, name: "Pomada Cicatrizante 30g",     category: "Medicamentos",          quantity: 12,  unitCost: 16.90, expirationDate: "2027-01-15", isDonation: false },
  { id: 24, name: "Soro Fisiológico 250ml",      category: "Medicamentos",          quantity: 18,  unitCost: 5.50,  expirationDate: "2026-05-15", isDonation: false },
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

// ─── Transaction Seed ─────────────────────────────────────────────────────────

const TRANSACTION_SEED: Transaction[] = [
  // Janeiro 2026
  { id: 1,  type: "receita",  amount: 2800.00, description: "Evento de Ano Novo — Jantar Beneficente",      category: "Evento de Arrecadação",  date: "2026-01-08" },
  { id: 2,  type: "doacao",   amount: 1500.00, description: "Doação Empresa Construtora Leal",              category: "Empresa",                date: "2026-01-12" },
  { id: 3,  type: "despesa",  amount: 1180.00, description: "Compra de alimentos básicos — Atacadão",       category: "Compra de Estoque",       date: "2026-01-14" },
  { id: 4,  type: "despesa",  amount: 430.00,  description: "Compra itens de higiene — Distribuidora",      category: "Compra de Estoque",       date: "2026-01-16" },
  { id: 5,  type: "despesa",  amount: 175.00,  description: "Frete entrega de doações — Motoboy",           category: "Logística e Transporte",  date: "2026-01-20" },
  { id: 6,  type: "receita",  amount: 600.00,  description: "Mensalidades voluntários jan/26",              category: "Mensalidades",           date: "2026-01-31" },
  // Fevereiro 2026
  { id: 7,  type: "doacao",   amount: 850.00,  description: "Campanha de Carnaval — vaquinha online",       category: "Campanha Online",        date: "2026-02-05" },
  { id: 8,  type: "doacao",   amount: 380.00,  description: "Doação Srª Maria Aparecida",                   category: "Pessoa Física",          date: "2026-02-10" },
  { id: 9,  type: "despesa",  amount: 960.00,  description: "Reposição de estoque — alimentos e bebidas",   category: "Compra de Estoque",       date: "2026-02-12" },
  { id: 10, type: "despesa",  amount: 118.00,  description: "Conta de luz sede fev/26",                     category: "Administrativo",         date: "2026-02-15" },
  { id: 11, type: "receita",  amount: 600.00,  description: "Mensalidades voluntários fev/26",              category: "Mensalidades",           date: "2026-02-28" },
  { id: 12, type: "despesa",  amount: 245.00,  description: "Material de escritório e limpeza sede",        category: "Serviços Gerais",        date: "2026-02-28" },
  // Março 2026
  { id: 13, type: "receita",  amount: 3200.00, description: "Bazar Solidário — 1ª Edição",                  category: "Evento de Arrecadação",  date: "2026-03-07" },
  { id: 14, type: "doacao",   amount: 2000.00, description: "Doação Supermercado Família",                  category: "Empresa",                date: "2026-03-10" },
  { id: 15, type: "despesa",  amount: 1480.00, description: "Compra alimentos — feira atacado março",       category: "Compra de Estoque",       date: "2026-03-11" },
  { id: 16, type: "despesa",  amount: 650.00,  description: "Compra medicamentos essenciais",               category: "Compra de Estoque",       date: "2026-03-13" },
  { id: 17, type: "despesa",  amount: 210.00,  description: "Transporte distribuição bairros",              category: "Logística e Transporte",  date: "2026-03-18" },
  { id: 18, type: "receita",  amount: 600.00,  description: "Mensalidades voluntários mar/26",              category: "Mensalidades",           date: "2026-03-31" },
  // Abril 2026
  { id: 19, type: "doacao",   amount: 450.00,  description: "Doação Sr. Carlos Mendes",                     category: "Pessoa Física",          date: "2026-04-03" },
  { id: 20, type: "doacao",   amount: 1200.00, description: "Campanha Páscoa Solidária — Instagram",        category: "Campanha Online",        date: "2026-04-14" },
  { id: 21, type: "despesa",  amount: 1320.00, description: "Compra de estoque — alimentos e higiene",      category: "Compra de Estoque",       date: "2026-04-15" },
  { id: 22, type: "despesa",  amount: 148.00,  description: "Conta de luz e água sede abr/26",              category: "Administrativo",         date: "2026-04-17" },
  { id: 23, type: "despesa",  amount: 270.00,  description: "Manutenção veículo de entregas",               category: "Logística e Transporte",  date: "2026-04-22" },
  { id: 24, type: "receita",  amount: 600.00,  description: "Mensalidades voluntários abr/26",              category: "Mensalidades",           date: "2026-04-30" },
  { id: 25, type: "receita",  amount: 1800.00, description: "Parceria Prefeitura Municipal — abr/26",       category: "Parceria Institucional", date: "2026-04-30" },
  // Maio 2026
  { id: 26, type: "receita",  amount: 4000.00, description: "Projeto Social Municipal — repasse mai/26",    category: "Projeto Social",         date: "2026-05-02" },
  { id: 27, type: "doacao",   amount: 1350.00, description: "Doação Empresa TechCare LTDA",                 category: "Empresa",                date: "2026-05-08" },
  { id: 28, type: "despesa",  amount: 1760.00, description: "Grande compra alimentos — Atacadão mai/26",    category: "Compra de Estoque",       date: "2026-05-09" },
  { id: 29, type: "despesa",  amount: 495.00,  description: "Reposição itens de higiene",                   category: "Compra de Estoque",       date: "2026-05-12" },
  { id: 30, type: "doacao",   amount: 300.00,  description: "Doação Srª Fernanda Lima",                     category: "Pessoa Física",          date: "2026-05-15" },
  { id: 31, type: "despesa",  amount: 185.00,  description: "Combustível entregas semana 3",                category: "Logística e Transporte",  date: "2026-05-20" },
  { id: 32, type: "receita",  amount: 600.00,  description: "Mensalidades voluntários mai/26",              category: "Mensalidades",           date: "2026-05-26" },
];

// ─── Products ─────────────────────────────────────────────────────────────────

function readRaw(): StoredProduct[] {
  const raw = localStorage.getItem(KEYS.products);
  if (raw) return JSON.parse(raw) as StoredProduct[];
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

// ─── Auth ─────────────────────────────────────────────────────────────────────

const DEFAULT_ADMIN: User = { email: "admin@ama.org", password: "admin123" };

function readUsers(): User[] {
  const stored = JSON.parse(localStorage.getItem(KEYS.users) ?? "[]") as User[];
  if (!stored.some((u) => u.email === DEFAULT_ADMIN.email)) {
    const withAdmin = [DEFAULT_ADMIN, ...stored];
    localStorage.setItem(KEYS.users, JSON.stringify(withAdmin));
    return withAdmin;
  }
  return stored;
}

export function registerUser(email: string, password: string): "ok" | "exists" {
  const users = readUsers();
  if (users.some((u) => u.email === email)) return "exists";
  localStorage.setItem(KEYS.users, JSON.stringify([...users, { email, password }]));
  logActivity({ action: "register", entity: "usuário", target: email, user: email });
  return "ok";
}

export function loginUser(email: string, password: string): boolean {
  return readUsers().some((u) => u.email === email && u.password === password);
}
