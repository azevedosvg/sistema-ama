import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, ChevronRight, Clock, PackageMinus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getProducts } from "../lib/storage";
import type { Product } from "../types/product";
import type { HomeTab } from "../pages/Home";

type Props = { onNavigate: (tab: HomeTab) => void };

type AlertItem = {
  product: Product;
  kind: "expired" | "critical" | "low";
};

const KIND_CONFIG: Record<
  AlertItem["kind"],
  { icon: typeof Bell; iconCls: string; chip: string; label: (p: Product) => string }
> = {
  expired: {
    icon: AlertTriangle,
    iconCls: "bg-red-100 text-red-600",
    chip: "bg-red-50 text-red-600",
    label: () => "Vencido",
  },
  critical: {
    icon: Clock,
    iconCls: "bg-orange-100 text-orange-600",
    chip: "bg-orange-50 text-orange-600",
    label: (p) => (p.daysToExpire === 0 ? "Vence hoje" : `Vence em ${p.daysToExpire}d`),
  },
  low: {
    icon: PackageMinus,
    iconCls: "bg-amber-100 text-amber-700",
    chip: "bg-amber-50 text-amber-700",
    label: (p) => `${p.quantity}/${p.minStock} un.`,
  },
};

export default function NotificationBell({ onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Recalcula ao abrir (e na montagem) para refletir o estado atual do estoque.
  const alerts = useMemo<AlertItem[]>(() => {
    const products = getProducts();
    const expired: AlertItem[] = [];
    const critical: AlertItem[] = [];
    const low: AlertItem[] = [];
    for (const p of products) {
      if (p.status === "expired") expired.push({ product: p, kind: "expired" });
      else if (p.status === "critical") critical.push({ product: p, kind: "critical" });
      if (p.lowStock && p.status !== "expired" && p.status !== "critical")
        low.push({ product: p, kind: "low" });
    }
    critical.sort((a, b) => a.product.daysToExpire - b.product.daysToExpire);
    return [...expired, ...critical, ...low];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const count = alerts.length;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function goToStock() {
    setOpen(false);
    onNavigate("estoque");
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Alertas${count > 0 ? ` (${count})` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-blue-100 transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-blue-900 ring-2 ring-blue-700">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-bold text-gray-900">Alertas</h3>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {count} {count === 1 ? "alerta" : "alertas"}
              </span>
            </div>

            {count === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                Nenhum alerta no momento. Tudo sob controle! 🎉
              </p>
            ) : (
              <ul className="max-h-80 divide-y divide-gray-50 overflow-y-auto">
                {alerts.map(({ product, kind }) => {
                  const cfg = KIND_CONFIG[kind];
                  const Icon = cfg.icon;
                  return (
                    <li key={`${kind}-${product.id}`}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={goToStock}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-blue-50/60 focus:outline-none focus-visible:bg-blue-50"
                      >
                        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${cfg.iconCls}`}>
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-800">{product.name}</span>
                          <span className="block truncate text-xs text-gray-500">{product.category}</span>
                        </span>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.chip}`}>
                          {cfg.label(product)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={goToStock}
              className="flex w-full items-center justify-center gap-1 border-t border-gray-100 px-4 py-3 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:bg-blue-50"
            >
              Ver estoque completo <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
