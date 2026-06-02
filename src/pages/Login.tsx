import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../lib/storage";

function SolidarityIllustration() {
  return (
    <svg viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm">
      {/* Soft glow halos */}
      <circle cx="170" cy="145" r="115" fill="white" fillOpacity="0.04" />
      <circle cx="170" cy="145" r="78" fill="white" fillOpacity="0.05" />

      {/* Ground shadow */}
      <ellipse cx="170" cy="208" rx="100" ry="8" fill="white" fillOpacity="0.1" />

      {/* ── Left person ── */}
      <ellipse cx="98" cy="157" rx="15" ry="27" fill="white" fillOpacity="0.82" />
      <circle  cx="98" cy="117" r="18"          fill="white" fillOpacity="0.90" />
      {/* left arm out */}
      <line x1="84"  y1="144" x2="55"  y2="158" stroke="white" strokeWidth="9" strokeLinecap="round" strokeOpacity="0.80" />
      {/* right arm → center */}
      <line x1="112" y1="144" x2="143" y2="139" stroke="white" strokeWidth="9" strokeLinecap="round" strokeOpacity="0.80" />

      {/* ── Center person (tallest) ── */}
      <ellipse cx="170" cy="147" rx="17" ry="30" fill="white" />
      <circle  cx="170" cy="104" r="21"          fill="white" />
      {/* left arm */}
      <line x1="153" y1="136" x2="127" y2="139" stroke="white" strokeWidth="9" strokeLinecap="round" />
      {/* right arm */}
      <line x1="187" y1="136" x2="213" y2="139" stroke="white" strokeWidth="9" strokeLinecap="round" />

      {/* ── Right person ── */}
      <ellipse cx="242" cy="157" rx="15" ry="27" fill="white" fillOpacity="0.82" />
      <circle  cx="242" cy="117" r="18"          fill="white" fillOpacity="0.90" />
      {/* left arm ← center */}
      <line x1="228" y1="144" x2="197" y2="139" stroke="white" strokeWidth="9" strokeLinecap="round" strokeOpacity="0.80" />
      {/* right arm out */}
      <line x1="256" y1="144" x2="285" y2="158" stroke="white" strokeWidth="9" strokeLinecap="round" strokeOpacity="0.80" />

      {/* Hand-clasp dots */}
      <circle cx="135" cy="139" r="7.5" fill="white" fillOpacity="0.65" />
      <circle cx="205" cy="139" r="7.5" fill="white" fillOpacity="0.65" />

      {/* ── Hearts ── */}
      {/* Big heart — center */}
      <path d="M170 95 C170 95 160 85 155 89 C150 93 155 102 170 112 C185 102 190 93 185 89 C180 85 170 95 170 95 Z" fill="#fbbf24" />
      {/* Small heart — left */}
      <path d="M98 100 C98 100 92 94 89 96.5 C86 99 89 104 98 110 C107 104 110 99 107 96.5 C104 94 98 100 98 100 Z" fill="#fbbf24" fillOpacity="0.75" />
      {/* Small heart — right */}
      <path d="M242 100 C242 100 236 94 233 96.5 C230 99 233 104 242 110 C251 104 254 99 251 96.5 C248 94 242 100 242 100 Z" fill="#fbbf24" fillOpacity="0.75" />

      {/* Tiny heart floating */}
      <path d="M170 72 C170 72 167 69 165.5 70 C164 71 165.5 73.5 170 76.5 C174.5 73.5 176 71 174.5 70 C173 69 170 72 170 72 Z" fill="#fbbf24" fillOpacity="0.55" />

      {/* ── Star sparkles ── */}
      <path d="M48 93 L50.2 85 L52.4 93 L60 95 L52.4 97 L50.2 105 L48 97 L40 95 Z"    fill="white" fillOpacity="0.30" />
      <path d="M290 93 L292.2 85 L294.4 93 L302 95 L294.4 97 L292.2 105 L290 97 L282 95 Z" fill="white" fillOpacity="0.30" />

      {/* Dot accents */}
      <circle cx="50"  cy="132" r="3.5" fill="#fbbf24" fillOpacity="0.55" />
      <circle cx="290" cy="132" r="3.5" fill="#fbbf24" fillOpacity="0.55" />
      <circle cx="136" cy="74"  r="3"   fill="#fbbf24" fillOpacity="0.45" />
      <circle cx="204" cy="74"  r="3"   fill="#fbbf24" fillOpacity="0.45" />
      <circle cx="72"  cy="174" r="2.5" fill="white"   fillOpacity="0.25" />
      <circle cx="268" cy="174" r="2.5" fill="white"   fillOpacity="0.25" />
      <circle cx="28"  cy="155" r="2"   fill="white"   fillOpacity="0.20" />
      <circle cx="312" cy="155" r="2"   fill="white"   fillOpacity="0.20" />

      {/* Curved caption arc (decorative) */}
      <path d="M80 220 Q170 232 260 220" stroke="white" strokeWidth="1.5" strokeOpacity="0.15" fill="none" strokeLinecap="round" />
    </svg>
  );
}

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
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mb-6 w-full"
          >
            <SolidarityIllustration />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-1">AMA</h1>
            <p className="text-blue-200 text-lg font-medium mb-3">Amigos Mãos Abertas</p>
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="w-10 h-0.5 bg-amber-400 rounded-full" />
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
              <div className="w-10 h-0.5 bg-amber-400 rounded-full" />
            </div>
            <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
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
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl mb-2">🤲</div>
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
