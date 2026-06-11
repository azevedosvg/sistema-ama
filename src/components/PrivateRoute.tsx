/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 1 — Autenticação & Controle de Acesso
 * PASSO 3 do roteiro: "O porteiro: proteção de rota" (~2:45–3:15)
 *
 * O que falar: arquivo curtinho, a lógica é uma linha só —
 * se existe token, renderiza o conteúdo; senão, <Navigate> manda para /login.
 *
 * 🗣️ Fala sugerida: "Esse componente é o porteiro. Se você tentar acessar a
 * página principal sem estar logado, ele te joga de volta pra tela de login
 * automaticamente."
 * ========================================================================== */
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}
