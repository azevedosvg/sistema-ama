/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 2 — Módulo de Produtos (Estoque)
 * PASSO 1 do roteiro: "O formato de um produto" (~0:40–1:20)
 *
 * O que falar: mostre o tipo Product e separe os campos em dois grupos —
 *  · Digitados pelo usuário: name, category, quantity, unitCost,
 *    expirationDate, isDonation, minStock.
 *  · CALCULADOS pelo sistema: status, daysToExpire, riskValue, lowStock.
 *
 * 🗣️ Fala sugerida: "O produto tem campos que o usuário preenche e campos que
 * o sistema calcula sozinho — como o status de vencimento e o valor em risco.
 * Essa separação foi proposital."
 * ========================================================================== */
export type Product = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  expirationDate: string;
  isDonation: boolean;
  /** Estoque mínimo (ponto de reposição). 0 = sem alerta de estoque baixo. */
  minStock: number;
  // [INT. 2 · PASSO 1] Daqui para baixo são os campos CALCULADOS (via enrich).
  status: "expired" | "critical" | "attention" | "safe";
  daysToExpire: number;
  riskValue: number;
  /** true quando minStock > 0 e a quantidade está no nível mínimo ou abaixo */
  lowStock: boolean;
};

export type DashboardData = {
  totalProducts: number;
  expiredProducts: number;
  criticalProducts: number;
  attentionProducts: number;
  safeProducts: number;
  lowStockProducts: number;
  totalRiskValue: number;
};


export type FieldErrors = {
  name: string;
  category: string;
  quantity: string;
  unitCost: string;
  expirationDate: string;
  minStock: string;
};

export type FormData = {
  name: string;
  category: string;
  quantity: string;
  unitCost: string;
  expirationDate: string;
  isDonation: boolean;
  minStock: string;
};
