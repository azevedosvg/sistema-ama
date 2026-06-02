import { createContext, useContext, useState } from "react";
import { logLogin, logLogout } from "../lib/storage";

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

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
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
