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
