export type Product = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  expirationDate: string;
  isDonation: boolean;
  status: "expired" | "critical" | "attention" | "safe";
  daysToExpire: number;
  riskValue: number;
};

export type DashboardData = {
  totalProducts: number;
  expiredProducts: number;
  criticalProducts: number;
  attentionProducts: number;
  safeProducts: number;
  totalRiskValue: number;
};


export type FieldErrors = {
  name: string;
  category: string;
  quantity: string;
  unitCost: string;
  expirationDate: string;
};

export type FormData = {
  name: string;
  category: string;
  quantity: string;
  unitCost: string;
  expirationDate: string;
  isDonation: boolean;
};
