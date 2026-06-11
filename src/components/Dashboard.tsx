/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 6 — Relatórios, Exportação & Dashboard
 * PASSO 1 do roteiro: "Os indicadores do estoque" (~0:40–1:30)
 * Mostre no topo da aba Estoque.
 *
 * O que falar: os cards — total de produtos, vencidos, críticos, em atenção,
 * seguros e o valor total em risco. Os números vêm PRONTOS da função
 * calcDashboard (módulo de Produtos, Integrante 2) — o Dashboard só os
 * exibe de forma visual.
 *
 * 🗣️ Fala sugerida: "Esses cards dão um raio-x do estoque num relance. Eu
 * recebo os números já calculados e cuido de apresentá-los com cor e
 * destaque, com o card principal em azul."
 * ========================================================================== */
import { motion, type Variants } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Package, PackageMinus, ShieldAlert, TrendingDown } from "lucide-react";
import type { DashboardData } from "../types/product";

type Props = { data: DashboardData };

const statusCards = (data: DashboardData) => [
  {
    label: "Vencidos",
    value: data.expiredProducts,
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    accent: "from-red-50",
    ring: "border-red-200",
    valueColor: data.expiredProducts > 0 ? "text-red-600" : "text-gray-900",
    urgent: data.expiredProducts > 0,
    barColor: "bg-red-500",
  },
  {
    label: "Críticos",
    value: data.criticalProducts,
    icon: ShieldAlert,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accent: "from-orange-50",
    ring: "border-orange-200",
    valueColor: data.criticalProducts > 0 ? "text-orange-600" : "text-gray-900",
    urgent: data.criticalProducts > 0,
    barColor: "bg-orange-500",
  },
  {
    label: "Em Atenção",
    value: data.attentionProducts,
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    accent: "from-amber-50",
    ring: "border-amber-200",
    valueColor: data.attentionProducts > 0 ? "text-amber-600" : "text-gray-900",
    urgent: false,
    barColor: "bg-amber-400",
  },
  {
    label: "Seguros",
    value: data.safeProducts,
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    accent: "from-green-50",
    ring: "border-green-200",
    valueColor: "text-green-700",
    urgent: false,
    barColor: "bg-green-500",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

export default function Dashboard({ data }: Props) {
  const cards = statusCards(data);
  const total = data.totalProducts;
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

  // Segments for the health distribution bar (only those with a value).
  const segments = cards.filter((c) => c.value > 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* ── Hero: Total + distribution bar ── */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -2 }}
        className="col-span-2 relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-700 to-blue-800 p-5 shadow-md transition-shadow hover:shadow-xl"
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-blue-500/30" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-blue-900/40" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold leading-none text-white">{total}</span>
              <span className="mb-1 text-sm font-medium text-blue-200">itens</span>
            </div>
            <p className="mt-1 text-sm font-medium text-blue-100">Total de Produtos</p>
            <div className="mt-2 h-0.5 w-8 rounded-full bg-amber-400" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Package size={22} className="text-white" />
          </div>
        </div>

        {/* distribution bar */}
        <div className="relative mt-5">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            {segments.map((s) => (
              <div
                key={s.label}
                className={s.barColor}
                style={{ width: `${pct(s.value)}%` }}
                title={`${s.label}: ${s.value}`}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {cards.map((c) => (
              <div key={c.label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${c.barColor}`} />
                <span className="text-xs text-blue-100">
                  {c.label} <span className="font-semibold text-white">{c.value}</span>
                </span>
              </div>
            ))}
          </div>

          {data.lowStockProducts > 0 && (
            <div className="relative mt-4 flex items-center gap-2 rounded-xl bg-amber-400/20 px-3 py-2 ring-1 ring-amber-300/40">
              <PackageMinus size={15} className="flex-shrink-0 text-amber-200" />
              <span className="text-xs font-medium text-amber-100">
                <span className="font-bold text-white">{data.lowStockProducts}</span>{" "}
                {data.lowStockProducts === 1 ? "item com estoque baixo" : "itens com estoque baixo"}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Valor em Risco ── */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -2 }}
        className="col-span-2 relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-400 to-amber-500 p-5 shadow-md transition-shadow hover:shadow-xl"
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute -bottom-12 right-12 h-24 w-24 rounded-full bg-amber-300/40" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-amber-950/80">Valor em Risco</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm">
              <TrendingDown size={22} className="text-amber-950" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold leading-none text-amber-950">
              <span className="text-xl align-top">R$ </span>
              {data.totalRiskValue.toFixed(2)}
            </p>
            <p className="mt-1.5 text-xs font-medium text-amber-950/70">
              Custo potencial de perdas por vencimento
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Status cards ── */}
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className={`relative overflow-hidden rounded-2xl border bg-linear-to-br to-white p-4 shadow-sm transition-shadow hover:shadow-md ${card.accent} ${
              card.urgent ? `${card.ring} ring-1 ring-inset ${card.ring.replace("border", "ring")}` : "border-blue-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                <Icon size={18} className={card.iconColor} />
              </div>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                {pct(card.value)}%
              </span>
            </div>
            <p className={`mt-3 text-2xl font-bold leading-none ${card.valueColor}`}>{card.value}</p>
            <p className="mt-1 text-xs font-medium text-gray-500">{card.label}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
