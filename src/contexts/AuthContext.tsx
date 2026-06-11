/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 1 — Autenticação & Controle de Acesso
 * PASSO 2 do roteiro: "O cérebro: o contexto de autenticação" (~1:30–2:45)
 * >>> Esta é a parte MAIS IMPORTANTE da sua fala. <<<
 *
 * O que falar neste arquivo (nesta ordem):
 *  1. O estado `token` é inicializado lendo o localStorage — por isso o
 *     usuário continua logado mesmo depois de atualizar a página (F5).
 *  2. `login()` salva o token e registra a entrada no Histórico (logLogin);
 *     `logout()` registra a saída (logLogout) e apaga o token.
 *  3. A linha `role = token ? getUserRole(token) : null` e o `isAdmin` —
 *     é daqui que sai a informação de quem é administrador.
 *  4. O hook `useAuth()` no final — é o que os outros componentes usam para
 *     saber quem está logado.
 *
 * 🗣️ Fala sugerida: "Em vez de passar o login de componente em componente,
 * eu centralizei isso num Context do React. Qualquer parte do sistema chama
 * useAuth() e já sabe quem está logado, qual o papel da pessoa e se ela é admin."
 * ========================================================================== */
import { createContext, useContext, useState } from "react";
import { getUserRole, logLogin, logLogout } from "../lib/storage";
import type { UserRole } from "../types/user";

type AuthContextType = {
  token: string | null;
  email: string | null;
  role: UserRole | null;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // [INT. 1 · PASSO 2.1] Token inicial vem do localStorage → sessão sobrevive ao F5.
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  // [INT. 1 · PASSO 2.3] Papel do usuário (admin/voluntário) derivado do token.
  const role: UserRole | null = token ? getUserRole(token) : null;

  // [INT. 1 · PASSO 2.2] login salva o token e registra a entrada no Histórico (Int. 5).
  function login(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    logLogin(newToken);
  }

  // [INT. 1 · PASSO 2.2] logout registra a saída no Histórico e apaga o token.
  function logout() {
    const current = localStorage.getItem("token");
    if (current) logLogout(current);
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, email: token, role, isAdmin: role === "admin", login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// [INT. 1 · PASSO 2.4] O hook que o resto do sistema usa para acessar a sessão.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
