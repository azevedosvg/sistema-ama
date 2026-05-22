import { Product } from "../types/product";

export const products: Product[] = [
  {
    id: 1,
    name: "Leite Integral",
    category: "Laticínios",
    quantity: 20,
    unitCost: 4.5,
    expirationDate: "2026-05-10",
  },
  {
    id: 2,
    name: "Pão de Forma",
    category: "Padaria",
    quantity: 12,
    unitCost: 6.9,
    expirationDate: "2026-05-24",
  },
  {
    id: 3,
    name: "Iogurte Natural",
    category: "Laticínios",
    quantity: 8,
    unitCost: 3.75,
    expirationDate: "2026-06-10",
  },
  {
    id: 4,
    name: "Arroz Tipo 1",
    category: "Mercearia",
    quantity: 30,
    unitCost: 22.5,
    expirationDate: "2026-12-20",
  },
];
