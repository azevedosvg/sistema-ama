import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../lib/storage";

export default function Login() {
  const { login } = useAuth();
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
    if (loginUser(email, password)) {
      login(email);
      navigate("/");
    } else {
      setError("Email ou senha incorretos.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (illustration) ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-blue-700 flex-col items-center justify-center p-12 relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-28 -right-28 w-80 h-80 bg-blue-600 rounded-full opacity-40" />
        <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-800 rounded-full opacity-40" />
        <div className="absolute top-1/3 right-10 w-28 h-28 bg-amber-400 rounded-full opacity-15" />
        <div className="absolute bottom-1/4 left-10 w-20 h-20 bg-amber-300 rounded-full opacity-10" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          {/* Logo oficial da ONG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="mb-7"
          >
            <Logo size={260} badge className="rounded-[2rem] shadow-xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="w-10 h-0.5 bg-amber-400 rounded-full" />
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
              <div className="w-10 h-0.5 bg-amber-400 rounded-full" />
            </div>
            <p className="text-blue-100 text-base leading-relaxed max-w-xs">
              Juntos fazemos a diferença. Controle de estoque para quem cuida de quem mais precisa.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-blue-50/40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile header */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <Logo size={88} badge className="mb-3 rounded-2xl shadow-md" />
            <h1 className="text-2xl font-extrabold text-blue-700">AMA</h1>
            <p className="text-gray-400 text-sm">Amigos Mãos Abertas</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="h-1 bg-linear-to-r from-blue-700 via-amber-400 to-blue-500" />
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo de volta</h2>
              <p className="text-gray-400 text-sm mb-7">Faça login para acessar o sistema</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all hover:border-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-blue-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all hover:border-blue-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2.5 rounded-xl border border-red-100"
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
                  {loading ? "Entrando..." : "Entrar"}
                </motion.button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <p className="text-center text-sm text-gray-400">
                Não tem conta?{" "}
                <Link to="/register" className="text-blue-700 font-semibold hover:underline">
                  Cadastrar
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            AMA · Amigos Mãos Abertas · Sistema de Gestão
          </p>
        </motion.div>
      </div>
    </div>
  );
}
