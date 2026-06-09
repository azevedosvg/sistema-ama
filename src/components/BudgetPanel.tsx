import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle, Gift, Info, Plus, Trash2, TrendingDown, Wallet, X } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import type { FinanceSummary, MonthlyFlow, Transaction, TransactionType } from "../types/finance";
import { TRANSACTION_CATEGORIES } from "../types/finance";

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TYPE_CONFIG: Record<TransactionType, { label: string; help: string; icon: React.ElementType; bg: string; text: string }> = {
  receita: { label: "Receita", help: "Dinheiro que entra (eventos, mensalidades, parcerias). Aumenta o saldo.", icon: ArrowUpCircle,   bg: "bg-green-100", text: "text-green-700" },
  despesa: { label: "Despesa", help: "Dinheiro que sai (compras, transporte, custos). Diminui o saldo.",        icon: ArrowDownCircle, bg: "bg-red-100",   text: "text-red-700"   },
  doacao:  { label: "Doação",  help: "Contribuições em dinheiro recebidas de doadores. Aumenta o saldo.",        icon: Gift,            bg: "bg-blue-100",  text: "text-blue-700"  },
};

const BANNER_TYPES: { key: TransactionType; sign: string; signCls: string; desc: string }[] = [
  { key: "receita", sign: "+", signCls: "text-green-600", desc: "Entradas próprias: eventos, mensalidades, parcerias." },
  { key: "doacao",  sign: "+", signCls: "text-amber-600", desc: "Contribuições em dinheiro recebidas de doadores." },
  { key: "despesa", sign: "−", signCls: "text-red-500",   desc: "Saídas e gastos: compras, transporte, custos." },
];

const PIE_COLORS = ["#1d4ed8", "#fbbf24", "#10b981", "#ef4444", "#8b5cf6", "#f97316", "#06b6d4"];

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChartWidget({ data }: { data: MonthlyFlow[] }) {
  const max = Math.max(...data.flatMap(d => [d.entradas, d.saidas, d.doacoes]), 1);
  const hasData = data.some(d => d.entradas || d.saidas || d.doacoes);
  const H = 160;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[180px] text-center gap-1">
        <p className="text-sm text-gray-500">Ainda não há movimentações nos últimos meses.</p>
        <p className="text-xs text-gray-300">Registre uma entrada ou saída para ver o gráfico.</p>
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-3">
      {/* Y axis reference */}
      <div className="flex flex-col justify-between items-end text-[10px] text-gray-300 h-[160px] pb-4 w-12 flex-shrink-0">
        <span>{BRL(max)}</span>
        <span>{BRL(max / 2)}</span>
        <span>R$ 0</span>
      </div>
      <div className="flex items-end gap-2 h-[160px] flex-1">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-0.5 w-full" style={{ height: H }}>
              {[
                { val: d.entradas, cls: "bg-blue-500",  name: "Entradas" },
                { val: d.saidas,   cls: "bg-red-400",   name: "Gastos"   },
                { val: d.doacoes,  cls: "bg-amber-400", name: "Doações"  },
              ].map(({ val, cls, name }, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: (val / max) * H }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
                  className={`flex-1 rounded-t-sm ${cls} min-h-[2px]`}
                  title={`${name}: ${BRL(val)}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pie Chart (SVG) ──────────────────────────────────────────────────────────

function PieChartWidget({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <TrendingDown size={22} className="text-red-200" />
        </div>
        <p className="text-sm font-medium text-gray-500">Nenhuma despesa registrada</p>
        <p className="text-xs text-gray-500 max-w-[200px]">Ao lançar despesas, elas aparecem aqui agrupadas por categoria.</p>
      </div>
    );
  }

  const size = 152;
  const cx = size / 2;
  const cy = size / 2;
  const r = 62;
  const stroke = 20;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const slices = data.map((d, i) => {
    const frac = d.value / total;
    const seg = { color: PIE_COLORS[i % PIE_COLORS.length], name: d.name, value: d.value, frac, offset };
    offset += frac;
    return seg;
  });

  const top = slices[0];

  return (
    <div className="flex gap-5 items-start">
      {/* Left: donut + maior gasto */}
      <div className="flex flex-col items-center gap-3 flex-shrink-0">
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            {slices.map((s, i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${s.frac * circ} ${circ}`}
                style={{ strokeDashoffset: -s.offset * circ }}
                strokeLinecap="butt"
              >
                <title>{s.name}: {BRL(s.value)} ({Math.round(s.frac * 100)}%)</title>
              </circle>
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase tracking-wide text-gray-500 leading-none">Total</span>
            <span className="text-sm font-bold text-gray-800 leading-tight mt-0.5">{BRL(total)}</span>
          </div>
        </div>

        {/* Biggest category highlight */}
        <div className="w-full rounded-xl border border-red-100 bg-red-50/60 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-red-400">Maior gasto</p>
          <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">{top.name}</p>
          <p className="text-sm font-bold text-red-600">{Math.round(top.frac * 100)}%</p>
        </div>
      </div>

      {/* Right: ranked categories */}
      <div className="flex-1 min-w-0 space-y-2.5 pt-1">
        {slices.map((s, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-gray-600 truncate">{s.name}</span>
              </div>
              <span className="font-semibold text-gray-700 flex-shrink-0 ml-1">
                {Math.round(s.frac * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.frac * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
                className="h-full rounded-full"
                style={{ background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TxRow({ tx, onDelete }: { tx: Transaction; onDelete: (id: number) => void }) {
  const cfg = TYPE_CONFIG[tx.type];
  const Icon = cfg.icon;
  const sign = tx.type === "despesa" ? "-" : "+";
  const formatted = new Intl.DateTimeFormat("pt-BR").format(new Date(tx.date + "T00:00:00"));
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 group"
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon size={15} className={cfg.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
        <p className="text-xs text-gray-500">{cfg.label} · {tx.category} · {formatted}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${tx.type === "despesa" ? "text-red-600" : tx.type === "doacao" ? "text-amber-600" : "text-green-700"}`}>
          {sign} {BRL(tx.amount)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(tx.id)}
          aria-label="Remover movimentação"
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Balance formula block ────────────────────────────────────────────────────

function FormulaCard({
  op, label, value, hint, icon: Icon, iconBg, iconColor, valueColor,
}: {
  op: string; label: string; value: string; hint: string;
  icon: React.ElementType; iconBg: string; iconColor: string; valueColor: string;
}) {
  return (
    <div className="relative flex-1 min-w-[130px] rounded-xl border border-gray-100 bg-white p-3">
      <span className="pointer-events-none absolute right-2 top-1 text-2xl font-bold text-gray-100 select-none">{op}</span>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon size={15} className={iconColor} />
      </div>
      <p className={`mt-2 text-lg font-bold leading-tight ${valueColor}`}>{value}</p>
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-[11px] text-gray-500 leading-tight">{hint}</p>
    </div>
  );
}

// ─── Props / Main ─────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all";

type Props = {
  summary: FinanceSummary;
  transactions: Transaction[];
  showForm: boolean;
  formData: { type: TransactionType; amount: string; description: string; category: string; date: string };
  formError: string;
  setShowForm: (v: boolean) => void;
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onDelete: (id: number) => void;
};

export default function BudgetPanel({ summary, transactions, showForm, formData, formError, setShowForm, onInputChange, onSubmit, onDelete }: Props) {
  const balancePositive = summary.balance >= 0;

  return (
    <div className="space-y-6">
      {/* Header + form toggle */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-amber-400 rounded-full flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Controle Financeiro</h2>
              <p className="text-sm text-gray-500">Acompanhe o dinheiro da instituição</p>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Cancelar" : "Nova movimentação"}
          </motion.button>
        </div>

        {/* Explanation banner */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 via-white to-amber-50/40 p-5 mb-4 shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-blue-100/40" />
          <div className="relative">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <Info size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Como funciona o controle financeiro</p>
                <p className="text-xs text-gray-500">Tudo que entra e sai do caixa da instituição</p>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              {BANNER_TYPES.map(({ key, sign, signCls, desc }) => {
                const cfg = TYPE_CONFIG[key];
                const Icon = cfg.icon;
                return (
                  <div key={key} className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white/80 p-3 backdrop-blur-sm">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                      <Icon size={16} className={cfg.text} />
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                        {cfg.label}
                        <span className={`text-xs font-bold ${signCls}`}>{sign}</span>
                      </p>
                      <p className="text-[11px] leading-snug text-gray-500">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Formula */}
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="text-gray-500">Saldo em caixa</span>
              <span className="text-gray-300">=</span>
              <span className="rounded-md bg-green-100 px-2 py-0.5 font-semibold text-green-700">Receitas</span>
              <span className="font-bold text-gray-500">+</span>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">Doações</span>
              <span className="font-bold text-gray-500">−</span>
              <span className="rounded-md bg-red-100 px-2 py-0.5 font-semibold text-red-600">Despesas</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-bold text-gray-800">Nova movimentação</p>
                <p className="text-xs text-gray-500 mb-4">{TYPE_CONFIG[formData.type].help}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
                    <select name="type" value={formData.type} onChange={onInputChange} className={inputCls}>
                      <option value="receita">Receita</option>
                      <option value="despesa">Despesa</option>
                      <option value="doacao">Doação</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</label>
                    <select name="category" value={formData.category} onChange={onInputChange} className={inputCls}>
                      <option value="">Selecionar...</option>
                      {TRANSACTION_CATEGORIES[formData.type].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor (R$)</label>
                    <input name="amount" type="number" step="0.01" min="0.01" placeholder="0,00" value={formData.amount} onChange={onInputChange} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Descrição</label>
                    <input name="description" type="text" placeholder="Ex: Compra de alimentos" value={formData.description} onChange={onInputChange} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</label>
                    <input name="date" type="date" value={formData.date} onChange={onInputChange} className={inputCls} />
                  </div>
                </div>
                {formError && <p className="text-xs text-red-500 font-medium mt-3">{formError}</p>}
                <div className="flex justify-end mt-4">
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold shadow-sm transition-colors">
                    Registrar
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Resumo do Caixa — saldo + how it is calculated */}
      <section className="rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden">
        <div className="h-1 bg-linear-to-r from-blue-700 to-blue-400" />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Resumo do Caixa</h3>
              <p className="text-xs text-gray-500">Quanto a instituição tem disponível hoje</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${balancePositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {balancePositive ? "Saldo positivo" : "Saldo negativo"}
            </span>
          </div>

          {/* Hero balance */}
          <div className="mt-4 flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${balancePositive ? "bg-blue-700" : "bg-red-600"}`}>
              <Wallet size={22} className="text-white" />
            </div>
            <div>
              <p className={`text-3xl sm:text-4xl font-extrabold leading-none ${balancePositive ? "text-blue-800" : "text-red-600"}`}>
                {BRL(summary.balance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Saldo atual em caixa</p>
            </div>
          </div>

          {/* Formula breakdown */}
          <p className="mt-5 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Como esse saldo é formado</p>
          <div className="flex flex-wrap gap-2">
            <FormulaCard
              op="+" label="Receitas" hint="entradas próprias" value={BRL(summary.totalReceitas)}
              icon={ArrowUpCircle} iconBg="bg-green-100" iconColor="text-green-600" valueColor="text-green-700"
            />
            <FormulaCard
              op="+" label="Doações" hint="recebidas em dinheiro" value={BRL(summary.totalDoacoes)}
              icon={Gift} iconBg="bg-amber-100" iconColor="text-amber-600" valueColor="text-amber-700"
            />
            <FormulaCard
              op="−" label="Despesas" hint="gastos e saídas" value={BRL(summary.totalDespesas)}
              icon={TrendingDown} iconBg="bg-red-100" iconColor="text-red-500" valueColor="text-red-600"
            />
            <FormulaCard
              op="=" label="Saldo" hint="resultado final" value={BRL(summary.balance)}
              icon={Wallet} iconBg={balancePositive ? "bg-blue-100" : "bg-red-100"} iconColor={balancePositive ? "text-blue-700" : "text-red-600"} valueColor={balancePositive ? "text-blue-800" : "text-red-600"}
            />
          </div>
        </div>
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-linear-to-r from-blue-700 to-blue-400" />
          <div className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">Fluxo Mensal</h3>
            <p className="text-xs text-gray-500 mb-3">Compare entradas, gastos e doações nos últimos 6 meses</p>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Entradas</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Gastos</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Doações</span>
            </div>
            <BarChartWidget data={summary.monthlyFlow} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-linear-to-r from-amber-400 to-amber-300" />
          <div className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">Para onde vai o dinheiro</h3>
            <p className="text-xs text-gray-500 mb-4">Despesas agrupadas por categoria</p>
            <PieChartWidget data={summary.expensesByCategory} />
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="h-1 bg-linear-to-r from-blue-700 via-amber-400 to-blue-500" />
        <div className="p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">Movimentações Recentes</h3>
          <p className="text-xs text-gray-500 mb-4">
            {transactions.length === 0
              ? "Todo registro lançado aparece aqui"
              : `Exibindo as últimas ${Math.min(transactions.length, 12)} de ${transactions.length} movimentações`}
          </p>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Wallet size={22} className="text-blue-300" />
              </div>
              <p className="text-sm text-gray-500 font-medium">Nenhuma movimentação ainda</p>
              <p className="text-xs text-gray-500 max-w-xs">Clique em “Nova movimentação” acima para registrar a primeira receita, despesa ou doação.</p>
            </div>
          ) : (
            transactions.slice(0, 12).map(tx => <TxRow key={tx.id} tx={tx} onDelete={onDelete} />)
          )}
        </div>
      </div>
    </div>
  );
}
