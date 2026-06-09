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
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const role: UserRole | null = token ? getUserRole(token) : null;

  function login(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    logLogin(newToken);
  }

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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
