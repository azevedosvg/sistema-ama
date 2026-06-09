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
