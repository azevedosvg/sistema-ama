import { motion, type Variants } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Boxes,
  ChevronRight,
  Package,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { getActivities, getMovements, getProducts, getTransactions } from "../lib/storage";
import { calcDashboard } from "../lib/productUtils";
import { formatBRL } from "../lib/exportUtils";
import type { HomeTab } from "../pages/Home";

type Props = { onNavigate: (tab: HomeTab) => void };

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function relativeTime(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso));
}

export default function Overview({ onNavigate }: Props) {
  const data = useMemo(() => {
    const products = getProducts();
    const transactions = getTransactions();
    const movements = getMovements();
    const activities = getActivities();

    const dash = calcDashboard(products);
    const balance =
      transactions.reduce((s, t) => s + (t.type === "despesa" ? -t.amount : t.amount), 0);

    // Itens que exigem atenção: vencidos/críticos (por validade) e estoque baixo.
    const atRisk = products
      .filter((p) => p.status === "expired" || p.status === "critical" || p.lowStock)
      .sort((a, b) => {
        const sev = (p: (typeof products)[number]) =>
          p.status === "expired" ? 0 : p.status === "critical" ? 1 : 2;
        return sev(a) - sev(b) || a.daysToExpire - b.daysToExpire;
      })
      .slice(0, 5);

    const entradas = movements.filter((m) => m.type === "entrada").reduce((s, m) => s + m.quantity, 0);
    const saidas = movements.filter((m) => m.type === "saida").reduce((s, m) => s + m.quantity, 0);

    return {
      dash,
      balance,
      atRisk,
      recentActivities: activities.slice(0, 6),
      movementCount: movements.length,
      entradas,
      saidas,
      totalUnits: products.reduce((s, p) => s + p.quantity, 0),
    };
  }, []);

  const stats = [
    {
      label: "Saldo em caixa",
      value: formatBRL(data.balance),
      icon: Wallet,
      accent: data.balance >= 0 ? "from-blue-700 to-blue-800" : "from-red-600 to-red-700",
      tab: "financeiro" as HomeTab,
    },
    {
      label: "Total de produtos",
      value: String(data.dash.totalProducts),
      sub: `${data.totalUnits} unidades`,
      icon: Package,
      accent: "from-slate-700 to-slate-800",
      tab: "estoque" as HomeTab,
    },
    {
      label: "Itens em risco",
      value: String(data.dash.expiredProducts + data.dash.criticalProducts),
      sub: formatBRL(data.dash.totalRiskValue) + " em risco",
      icon: TrendingDown,
      accent: "from-amber-500 to-amber-600",
      tab: "estoque" as HomeTab,
    },
    {
      label: "Movimentações",
      value: String(data.movementCount),
      sub: `${data.entradas} entr. · ${data.saidas} saíd.`,
      icon: Boxes,
      accent: "from-emerald-600 to-emerald-700",
      tab: "movimentacao" as HomeTab,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 flex-shrink-0 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Visão Geral</h2>
          <p className="text-sm text-gray-500">Resumo consolidado do estoque, finanças e atividades</p>
        </div>
      </div>

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.label}
              variants={item}
              whileHover={{ y: -3 }}
              onClick={() => onNavigate(s.tab)}
              className={`group relative overflow-hidden rounded-2xl bg-linear-to-br ${s.accent} p-5 text-left shadow-md transition-shadow hover:shadow-xl`}
            >
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
              <div className="relative flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Icon size={20} className="text-white" />
                </div>
                <ArrowRight size={16} className="text-white/60 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="relative mt-4 text-2xl font-extrabold leading-none text-white">{s.value}</p>
              <p className="relative mt-1.5 text-sm font-medium text-white/90">{s.label}</p>
              {s.sub && <p className="relative mt-0.5 text-xs text-white/70">{s.sub}</p>}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Itens em risco */}
        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-amber-500" />
              <h3 className="text-base font-bold text-gray-900">Itens que exigem atenção</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("estoque")}
              className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Ver estoque <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-3">
            {data.atRisk.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-gray-500">
                Nenhum item vencido ou crítico. Tudo sob controle! 🎉
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.atRisk.map((p) => {
                  const expired = p.status === "expired";
                  const critical = p.status === "critical";
                  // Item só com estoque baixo (sem alerta de validade) ganha rótulo próprio
                  const lowOnly = !expired && !critical && p.lowStock;
                  const badge = expired
                    ? { dot: "bg-red-500", chip: "bg-red-50 text-red-600", text: "Vencido" }
                    : critical
                      ? { dot: "bg-orange-500", chip: "bg-orange-50 text-orange-600", text: `${p.daysToExpire}d` }
                      : { dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700", text: "Estoque baixo" };
                  return (
                    <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                      <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${badge.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {p.category} · {p.quantity} un.
                          {lowOnly && p.minStock > 0 && ` · mín. ${p.minStock}`}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.chip}`}>
                        {badge.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Atividade recente */}
        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <Boxes size={17} className="text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">Atividade recente</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("historico")}
              className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Ver histórico <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-3">
            {data.recentActivities.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-gray-500">Nenhuma atividade registrada ainda.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.recentActivities.map((a) => {
                  const isOut = a.action === "delete";
                  return (
                    <li key={a.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          isOut ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isOut ? <ArrowDownCircle size={15} /> : <ArrowUpCircle size={15} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">{a.user}</span> · {a.target}
                        </p>
                        <p className="text-xs text-gray-400">{a.entity}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs text-gray-400">{relativeTime(a.timestamp)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
