/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 2 — Módulo de Produtos (Estoque) · PASSO 4
 * Cada produto vira um card com a COR do seu status (faixa no topo):
 * vermelho = vencido, laranja = crítico, âmbar = atenção, verde = seguro.
 * Aponte o STATUS_CONFIG abaixo como o "mapa" dessas cores.
 * ========================================================================== */
import { motion, type Variants } from "framer-motion";
import { AlertTriangle, CalendarDays, Gift, Package, Pencil, Tag, Trash2, TrendingDown } from "lucide-react";
import type { Product } from "../types/product";

const STATUS_CONFIG: Record<
  Product["status"],
  { label: string; badge: string; headerBg: string; dot: string; expiryColor: string }
> = {
  expired: {
    label: "Vencido",
    badge: "bg-red-100 text-red-700 ring-1 ring-red-200",
    headerBg: "bg-red-50",
    dot: "bg-red-500",
    expiryColor: "text-red-600",
  },
  critical: {
    label: "Crítico",
    badge: "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
    headerBg: "bg-orange-50",
    dot: "bg-orange-500",
    expiryColor: "text-orange-600",
  },
  attention: {
    label: "Atenção",
    badge: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    headerBg: "bg-amber-50",
    dot: "bg-amber-500",
    expiryColor: "text-amber-700",
  },
  safe: {
    label: "Seguro",
    badge: "bg-green-100 text-green-700 ring-1 ring-green-200",
    headerBg: "bg-green-50",
    dot: "bg-green-500",
    expiryColor: "text-green-700",
  },
};

function expiryLabel(days: number): string {
  if (!isFinite(days)) return "";
  if (days < 0) return `Vencido há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? "s" : ""}`;
  if (days === 0) return "Vence hoje";
  return `Vence em ${days} dia${days !== 1 ? "s" : ""}`;
}

type Props = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProductCard({ product, onEdit, onDelete }: Props) {
  const config = STATUS_CONFIG[product.status];
  const isDonation = product.isDonation;
  const label = expiryLabel(product.daysToExpire);

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-blue-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow bg-white h-full"
    >
      {/* Tinted header matching status */}
      <div className={`px-4 pt-4 pb-3.5 ${isDonation ? "bg-blue-50" : config.headerBg}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
              {product.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-white/80 px-2 py-0.5 rounded-full border border-gray-200/70">
                <Tag size={9} />
                {product.category}
              </span>
              <span className="text-[10px] font-mono font-semibold text-gray-400/80">#{product.id}</span>
            </div>
          </div>

          {isDonation ? (
            <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-700 text-white">
              <Gift size={11} />
              Doação
            </span>
          ) : (
            <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-col gap-3 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${product.lowStock ? "bg-orange-50" : "bg-gray-50"}`}>
            <Package size={14} className={`flex-shrink-0 ${product.lowStock ? "text-orange-500" : "text-gray-400"}`} />
            <div>
              <p className="text-[10px] text-gray-400 leading-none mb-0.5">Quantidade</p>
              <p className={`font-bold text-sm leading-none ${product.lowStock ? "text-orange-700" : "text-gray-800"}`}>
                {product.quantity} un.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
            <span className="text-gray-400 text-xs flex-shrink-0 font-bold">R$</span>
            <div>
              <p className="text-[10px] text-gray-400 leading-none mb-0.5">Custo unit.</p>
              {isDonation ? (
                <p className="font-bold text-blue-700 text-sm leading-none">Gratuito</p>
              ) : (
                <p className="font-bold text-gray-800 text-sm leading-none">
                  {Number(product.unitCost).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Expiry countdown */}
        {label && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${config.expiryColor}`}>
            <CalendarDays size={12} />
            <span>{label}</span>
          </div>
        )}

        {/* Low stock warning */}
        {product.lowStock && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-50 rounded-xl px-3 py-2 border border-orange-100">
            <AlertTriangle size={13} />
            <span>Estoque baixo · mínimo {product.minStock} un.</span>
          </div>
        )}

        {/* Risk value */}
        {!isDonation && product.riskValue > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
            <TrendingDown size={13} />
            <span>Valor em risco: R$ {product.riskValue.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4 pt-2 border-t border-gray-100 mt-auto">
        <motion.button
          type="button"
          onClick={() => onEdit(product)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <Pencil size={13} />
          Editar
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onDelete(product.id)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <Trash2 size={13} />
        </motion.button>
      </div>
    </motion.article>
  );
}
