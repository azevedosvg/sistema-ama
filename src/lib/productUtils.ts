/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 2 — Módulo de Produtos (Estoque)
 * PASSO 2 do roteiro: "A lógica pura — o cérebro do módulo" (~1:20–2:50)
 * >>> Esta é a parte mais "impressionante" de mostrar. <<<
 *
 * O que apontar, nesta ordem:
 *  1. PERISHABLE_CATEGORIES / isPerishable() — categorias que exigem validade.
 *  2. getDaysToExpire() — quantos dias faltam para vencer.
 *  3. getProductStatus() — as regras: <0 vencido, ≤7 crítico, ≤30 atenção,
 *     senão seguro.
 *  4. enrich() — pega o produto "cru" e devolve com os campos calculados.
 *  5. calcDashboard() — conta produtos por status (alimenta o painel do Int. 6).
 *
 * 🗣️ Fala sugerida: "Eu isolei toda a regra de negócio aqui, separada da
 * interface. A função enrich recebe o produto cru e calcula o status pela data
 * de validade, e o riskValue (quantidade × custo) só para itens críticos ou
 * vencidos. Assim a tela só exibe, não calcula."
 * ========================================================================== */
import type { Product } from "../types/product";

type StoredProduct = Omit<Product, "status" | "daysToExpire" | "riskValue" | "lowStock">;

export const PERISHABLE_CATEGORIES = new Set([
  "Alimentos",
  "Bebidas",
  "Higiene e Limpeza",
  "Medicamentos",
]);

export function isPerishable(category: string): boolean {
  return PERISHABLE_CATEGORIES.has(category);
}

export function getDaysToExpire(expirationDate: string): number {
  if (!expirationDate) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate + "T00:00:00");
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// [INT. 2 · PASSO 2.3] A regra central de validade: vencido / crítico / atenção / seguro.
export function getProductStatus(expirationDate: string): Product["status"] {
  if (!expirationDate) return "safe";
  const days = getDaysToExpire(expirationDate);
  if (days < 0) return "expired";
  if (days <= 7) return "critical";
  if (days <= 30) return "attention";
  return "safe";
}

export function isLowStock(quantity: number, minStock: number): boolean {
  return minStock > 0 && quantity <= minStock;
}

// [INT. 2 · PASSO 2.4] enrich: produto "cru" entra, produto com campos calculados sai.
export function enrich(p: StoredProduct): Product {
  const status = getProductStatus(p.expirationDate);
  const atRisk = status === "expired" || status === "critical";
  return {
    ...p,
    status,
    daysToExpire: getDaysToExpire(p.expirationDate),
    riskValue: p.isDonation || !atRisk ? 0 : p.quantity * p.unitCost,
    lowStock: isLowStock(p.quantity, p.minStock),
  };
}


// [INT. 2 · PASSO 2.5] Alimenta os cards de indicadores do Dashboard (Integrante 6).
export function calcDashboard(products: Product[]) {
  return {
    totalProducts: products.length,
    expiredProducts: products.filter((p) => p.status === "expired").length,
    criticalProducts: products.filter((p) => p.status === "critical").length,
    attentionProducts: products.filter((p) => p.status === "attention").length,
    safeProducts: products.filter((p) => p.status === "safe").length,
    lowStockProducts: products.filter((p) => p.lowStock).length,
    totalRiskValue: products
      .filter((p) => !p.isDonation)
      .reduce((sum, p) => sum + p.riskValue, 0),
  };
}
