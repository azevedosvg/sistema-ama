/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 1 — Autenticação & Controle de Acesso
 * Complemento do PASSO 4: a tela de cadastro.
 *
 * Não precisa abrir slide a slide — basta CITAR durante o passo 4:
 * "A tela de cadastro segue o mesmo padrão da de login, chamando registerUser;
 * se o e-mail já existe, mostro o erro 'Este email já está cadastrado'."
 * ========================================================================== */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "../lib/storage";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = registerUser(email, password);
    if (result === "exists") {
      setError("Este email já está cadastrado.");
      setLoading(false);
      return;
    }

    navigate("/login");
  }

  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-blue-700 flex-col items-center justify-center p-12 text-white relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600 rounded-full opacity-40" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-800 rounded-full opacity-40" />
        <div className="absolute top-1/3 right-8 w-24 h-24 bg-amber-400 rounded-full opacity-20" />

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-7xl mb-6 select-none"
          >
            🤲
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h1 className="text-5xl font-extrabold tracking-tight mb-1">AMA</h1>
            <p className="text-blue-200 text-lg font-medium mb-6">Amigos Mãos Abertas</p>
            <div className="w-12 h-1 bg-amber-400 mx-auto rounded-full mb-6" />
            <p className="text-blue-100 text-base leading-relaxed max-w-xs">
              Crie sua conta para gerenciar o estoque da instituição com segurança.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl mb-2">🤲</div>
            <h1 className="text-2xl font-extrabold text-blue-700">AMA</h1>
            <p className="text-gray-500 text-sm">Amigos Mãos Abertas</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Criar conta</h2>
            <p className="text-gray-500 text-sm mb-7">Preencha os dados para se cadastrar</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2.5 rounded-lg border border-red-100"
                >
                  <span className="text-base">⚠️</span>
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-1 shadow-sm"
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </motion.button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Já tem conta?{" "}
              <Link to="/login" className="text-blue-700 font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
