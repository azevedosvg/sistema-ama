import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  History,
  LogIn,
  LogOut,
  PencilLine,
  PlusCircle,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import type { Activity, ActivityAction } from "../types/activity";
import { useActivities } from "../hooks/useActivities";

const ACTION_CONFIG: Record<
  ActivityAction,
  { label: string; verb: string; icon: React.ElementType; bg: string; text: string; ring: string }
> = {
  login:    { label: "Entrada",  verb: "entrou no sistema", icon: LogIn,      bg: "bg-green-100",  text: "text-green-700",  ring: "ring-green-200"  },
  logout:   { label: "Saída",    verb: "saiu do sistema",   icon: LogOut,     bg: "bg-gray-100",   text: "text-gray-600",   ring: "ring-gray-200"   },
  register: { label: "Cadastro", verb: "criou a conta",     icon: UserPlus,   bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-200" },
  create:   { label: "Inclusão", verb: "cadastrou",         icon: PlusCircle, bg: "bg-blue-100",   text: "text-blue-700",   ring: "ring-blue-200"   },
  update:   { label: "Edição",   verb: "editou",            icon: PencilLine, bg: "bg-amber-100",  text: "text-amber-700",  ring: "ring-amber-200"  },
  delete:   { label: "Remoção",  verb: "removeu",           icon: Trash2,     bg: "bg-red-100",    text: "text-red-600",    ring: "ring-red-200"    },
};

const ACTION_FILTERS: { value: "" | ActivityAction; label: string }[] = [
  { value: "",         label: "Todas as ações" },
  { value: "create",   label: "Inclusões" },
  { value: "update",   label: "Edições" },
  { value: "delete",   label: "Remoções" },
  { value: "login",    label: "Entradas" },
  { value: "logout",   label: "Saídas" },
  { value: "register", label: "Cadastros de conta" },
];

const selectCls =
  "min-w-0 max-w-full truncate px-3 py-2 rounded-xl border border-blue-100 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all";

// ─── Date helpers ───────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso));
}

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(date, today)) return "Hoje";
  if (sameDay(date, yesterday)) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function fullTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function describe(a: Activity): string {
  const cfg = ACTION_CONFIG[a.action];
  // Para sessão/conta o alvo é o próprio usuário — evita repetir o email
  if (a.action === "login" || a.action === "logout" || a.action === "register") {
    return cfg.verb;
  }
  return `${cfg.verb} ${a.entity}`;
}

// ─── Row ────────────────────────────────────────────────────────────────────────

function ActivityItem({ activity }: { activity: Activity }) {
  const cfg = ACTION_CONFIG[activity.action];
  const Icon = cfg.icon;
  const showTarget = !["login", "logout", "register"].includes(activity.action);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 py-3.5 border-b border-gray-50 last:border-0"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ${cfg.bg} ${cfg.ring}`}>
        <Icon size={16} className={cfg.text} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-gray-700 leading-snug">
            <span className="font-semibold text-gray-900">{activity.user}</span>{" "}
            {describe(activity)}
            {showTarget && (
              <span className="font-semibold text-gray-900"> “{activity.target}”</span>
            )}
          </p>
          <span
            className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0"
            title={new Date(activity.timestamp).toLocaleString("pt-BR")}
          >
            {fullTime(activity.timestamp)}
          </span>
        </div>

        {/* Alterações campo a campo (edições) */}
        {activity.changes && activity.changes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activity.changes.map((c) => (
              <span
                key={c.field}
                className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg px-2 py-1"
              >
                <span className="font-medium text-gray-500">{c.label}:</span>
                <span className="text-gray-400 line-through">{c.from}</span>
                <ArrowRight size={11} className="text-gray-300" />
                <span className="font-semibold text-gray-700">{c.to}</span>
              </span>
            ))}
          </div>
        )}

        {activity.action === "update" && (!activity.changes || activity.changes.length === 0) && (
          <p className="mt-1 text-xs text-gray-400 italic">Salvo sem mudanças nos campos.</p>
        )}

        <span className="mt-1 inline-block text-[11px] text-gray-300">{relativeTime(activity.timestamp)}</span>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ActivityLog() {
  const {
    activities,
    total,
    users,
    search,
    actionFilter,
    userFilter,
    setSearch,
    setActionFilter,
    setUserFilter,
  } = useActivities();

  // Agrupa por dia preservando a ordem (já vem do mais recente)
  const groups: { day: string; items: Activity[] }[] = [];
  for (const a of activities) {
    const day = dayLabel(a.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(a);
    else groups.push({ day, items: [a] });
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 bg-amber-400 rounded-full flex-shrink-0" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Histórico de Alterações</h2>
          <p className="text-sm text-gray-500">
            Quem entrou, quem saiu e tudo o que foi cadastrado, editado ou removido
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por item, usuário ou campo..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-blue-100 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value as "" | ActivityAction)} className={selectCls}>
          {ACTION_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className={`${selectCls} sm:w-48`}>
          <option value="">Todos os usuários</option>
          {users.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="h-1 bg-linear-to-r from-blue-700 via-amber-400 to-blue-500" />
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Linha do tempo</h3>
          <span className="text-xs text-gray-400">
            {activities.length} de {total} {total === 1 ? "registro" : "registros"}
          </span>
        </div>

        <div className="p-6 pt-2">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                <History size={22} className="text-blue-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Nenhum registro encontrado</p>
              <p className="text-xs text-gray-400 mt-1">
                {total === 0
                  ? "As ações realizadas no sistema aparecerão aqui."
                  : "Ajuste os filtros para ver outros registros."}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {groups.map((g) => (
                <div key={g.day} className="mt-4 first:mt-2">
                  <div className="flex items-center gap-2 mb-1 py-1">
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-700">{g.day}</span>
                    <span className="flex-1 h-px bg-gray-100" />
                  </div>
                  {g.items.map((a) => (
                    <ActivityItem key={a.id} activity={a} />
                  ))}
                </div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
