/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 1 — Autenticação & Controle de Acesso
 * PASSO 5 do roteiro: "Os tipos (papéis)"
 *
 * O que falar: mostre UserRole = "admin" | "voluntario" e o ROLE_LABELS
 * (que traduz o papel para exibição). Diga que esses tipos são usados por
 * todo o sistema para decidir permissões.
 *
 * (O INTEGRANTE 7 — Gestão de Usuários — também usa estes tipos: cite que a
 * área restrita e a troca de papéis se baseiam neste UserRole.)
 * ========================================================================== */
export type UserRole = "admin" | "voluntario";

// Usuário exposto para a interface (sem a senha)
export type AppUser = {
  email: string;
  role: UserRole;
  createdAt: string; // ISO
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  voluntario: "Voluntário",
};
