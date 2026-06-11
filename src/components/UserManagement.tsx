/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 7 — Gestão de Usuários & Papéis
 * PASSO 4 do roteiro: "A tela" (~2:30–4:00) · DEMONSTRE NO NAVEGADOR
 *
 * O que mostrar: a tabela de usuários com o seletor de papel e o botão de
 * remover, e o admin padrão aparecendo como protegido (cadeado).
 *
 * Demonstração marcante: troque o papel de alguém; depois faça logout, entre
 * como voluntário (ana.voluntaria@ama.org / senha123) e mostre que a aba
 * Usuários SOME do menu.
 * ========================================================================== */
import { motion } from "framer-motion";
import { Lock, Shield, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useUsers } from "../hooks/useUsers";
import { ROLE_LABELS, type UserRole } from "../types/user";
import ConfirmDialog from "./ui/ConfirmDialog";
import EmptyState from "./ui/EmptyState";
import { useToast } from "./ui/Toast";

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export default function UserManagement() {
  const { email: currentEmail } = useAuth();
  const { users, adminCount, changeRole, removeUser, isProtected } = useUsers();
  const { notify } = useToast();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function onChangeRole(email: string, role: UserRole) {
    // Impede remover o último administrador do sistema
    if (role === "voluntario" && adminCount <= 1) {
      notify("É preciso manter ao menos um administrador.", "error");
      return;
    }
    changeRole(email, role);
    notify(`Papel de ${email} atualizado para ${ROLE_LABELS[role]}.`, "success");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 flex-shrink-0 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestão de Usuários</h2>
          <p className="text-sm text-gray-500">
            Defina papéis e gerencie quem tem acesso administrativo ao sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
            <Users size={20} className="text-blue-700" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none text-gray-900">{users.length}</p>
            <p className="mt-1 text-xs font-medium text-gray-500">Usuários</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
            <ShieldCheck size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none text-gray-900">{adminCount}</p>
            <p className="mt-1 text-xs font-medium text-gray-500">Administradores</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="h-1 bg-linear-to-r from-blue-700 via-amber-400 to-blue-500" />
        {users.length === 0 ? (
          <EmptyState icon={UserCog} title="Nenhum usuário cadastrado" />
        ) : (
          <ul className="divide-y divide-gray-50">
            {users.map((u) => {
              const protectedUser = isProtected(u.email);
              const isSelf = u.email === currentEmail;
              const isAdmin = u.role === "admin";
              return (
                <motion.li
                  key={u.email}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-wrap items-center gap-3 px-5 py-4"
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${
                      isAdmin ? "bg-blue-700" : "bg-slate-400"
                    }`}
                  >
                    {initials(u.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">{u.email}</p>
                      {isSelf && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          você
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Desde {fmtDate(u.createdAt)}</p>
                  </div>

                  {/* Badge de papel */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isAdmin ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isAdmin ? <Shield size={12} /> : <UserCog size={12} />}
                    {ROLE_LABELS[u.role]}
                  </span>

                  {/* Ações */}
                  {protectedUser ? (
                    <span
                      className="flex items-center gap-1 text-xs text-gray-300"
                      title="Administrador padrão — não pode ser alterado"
                    >
                      <Lock size={13} /> Permanente
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => onChangeRole(u.email, e.target.value as UserRole)}
                        aria-label={`Papel de ${u.email}`}
                        className="cursor-pointer rounded-xl border border-blue-100 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="voluntario">Voluntário</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(u.email)}
                        aria-label={`Remover ${u.email}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remover usuário"
        message={`Tem certeza que deseja remover "${pendingDelete}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Remover"
        onConfirm={() => {
          if (pendingDelete) {
            removeUser(pendingDelete);
            notify("Usuário removido.", "info");
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
