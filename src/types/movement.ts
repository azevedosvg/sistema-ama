export type MovementType = "entrada" | "saida";

// Movimentação de estoque: entrada (reposição/recebimento) ou saída (distribuição/baixa)
export type StockMovement = {
  id: number;
  productId: number;
  productName: string;
  type: MovementType;
  quantity: number;
  reason: string; // motivo da entrada ou destino da saída
  party?: string; // doador (entrada) ou beneficiário/destino (saída) — opcional
  date: string; // YYYY-MM-DD
  user: string; // quem registrou (email)
};

// Motivos sugeridos por tipo de movimentação
export const MOVEMENT_REASONS: Record<MovementType, string[]> = {
  entrada: ["Compra", "Doação recebida", "Devolução", "Ajuste de inventário", "Outros"],
  saida: ["Distribuição", "Doação entregue", "Perda/Vencimento", "Ajuste de inventário", "Outros"],
};

// Rótulo do campo "party" conforme o tipo de movimentação
export const PARTY_LABELS: Record<MovementType, string> = {
  entrada: "Doador / Fornecedor",
  saida: "Beneficiário / Destino",
};
