/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 7 — Gestão de Usuários & Papéis
 * PASSO 2 do roteiro: "As ações sobre usuários" (~1:30–2:30)
 *
 * O que falar: mostre changeRole (promover/rebaixar), removeUser (excluir)
 * e isProtected — a trava que impede o admin padrão (admin@ama.org) de ser
 * editado ou removido. Mostre também o adminCount.
 *
 * 🗣️ Fala sugerida: "Aqui ficam as ações: mudar o papel de alguém e remover
 * contas. Coloquei uma trava: o administrador padrão é permanente, não pode
 * ser rebaixado nem apagado, pra nunca ficarmos sem acesso de admin."
 * ========================================================================== */
import { useState } from "react";
import type { AppUser, UserRole } from "../types/user";
import { deleteUser, getUsers, updateUserRole } from "../lib/storage";

const ADMIN_EMAIL = "admin@ama.org";

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>(() => getUsers());

  function refresh() {
    setUsers(getUsers());
  }

  function changeRole(email: string, role: UserRole) {
    updateUserRole(email, role);
    refresh();
  }

  function removeUser(email: string) {
    deleteUser(email);
    refresh();
  }

  // O admin padrão é permanente (não pode ser editado nem removido)
  function isProtected(email: string): boolean {
    return email === ADMIN_EMAIL;
  }

  const adminCount = users.filter((u) => u.role === "admin").length;

  return { users, adminCount, refresh, changeRole, removeUser, isProtected };
}
