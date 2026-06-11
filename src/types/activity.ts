/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 5 — Histórico & Auditoria
 * PASSO 1 do roteiro: "O formato de um registro" (~0:40–1:20)
 *
 * O que falar: mostre o tipo Activity — timestamp (quando), user (quem),
 * action (login, create, update, delete…), entity (produto, usuário,
 * estoque…), target (o que foi afetado) e changes (alterações campo a campo).
 * Destaque o tipo FieldChange (label, from, to).
 *
 * 🗣️ Fala sugerida: "Cada registro responde quatro perguntas: quem, o quê,
 * em quê e quando. E nas edições eu guardo também o antes e o depois de
 * cada campo."
 * ========================================================================== */
export type ActivityAction =
  | "login"
  | "logout"
  | "register"
  | "create"
  | "update"
  | "delete";

export type ActivityEntity =
  | "produto"
  | "movimentação"
  | "estoque"
  | "sessão"
  | "usuário";

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
