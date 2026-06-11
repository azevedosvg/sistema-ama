/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 1 — Autenticação & Controle de Acesso
 * PASSO 1 do roteiro: "O esqueleto das rotas" (~0:30–1:30 da fala)
 *
 * O que falar neste arquivo:
 *  1. Mostre o <BrowserRouter> e as três rotas: /login, /register e / (principal).
 *  2. Destaque que a rota "/" está "embrulhada" por <PrivateRoute> — é isso
 *     que a protege de acessos sem login.
 *  3. Mostre que tudo fica dentro de <AuthProvider> (o cérebro da autenticação)
 *     e de <ToastProvider> (avisos globais — parte do Integrante 8).
 *
 * 🗣️ Fala sugerida: "A aplicação tem três rotas. A rota raiz é protegida: ela
 * só renderiza a página principal se o usuário estiver logado — quem garante
 * isso é o PrivateRoute. E tudo fica dentro do AuthProvider, que é o cérebro
 * da autenticação."
 * ========================================================================== */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      {/* [INTEGRANTE 8 · PASSO 1] O ToastProvider envolve o app inteiro:
          qualquer módulo chama useToast() e exibe um aviso padronizado. */}
      <ToastProvider>
        {/* [INTEGRANTE 1 · PASSO 1] AuthProvider: todo o app enxerga quem está logado. */}
        <AuthProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* [INTEGRANTE 1 · PASSO 1] Rota raiz protegida: o PrivateRoute só deixa
              passar quem está logado — aponte este "embrulho" na apresentação. */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
