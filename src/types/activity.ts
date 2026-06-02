export type ActivityAction =
  | "login"
  | "logout"
  | "register"
  | "create"
  | "update"
  | "delete";

export type ActivityEntity = "produto" | "movimentação" | "sessão" | "usuário";

// Alteração campo a campo — usada em edições para mostrar "de → para"
export type FieldChange = {
  field: string;
  label: string;
  from: string;
  to: string;
};

export type Activity = {
  id: number;
  timestamp: string; // ISO — quando aconteceu
  user: string;      // quem fez (email)
  action: ActivityAction;
  entity: ActivityEntity;
  target: string;        // nome do item afetado (produto, descrição, email...)
  changes?: FieldChange[]; // o que mudou (somente em "update")
};
