import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  Boxes,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useMovements } from "../hooks/useMovements";
import { MOVEMENT_REASONS, PARTY_LABELS, type MovementType } from "../types/movement";
import ConfirmDialog from "./ui/ConfirmDialog";
import EmptyState from "./ui/EmptyState";
import { useToast } from "./ui/Toast";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all placeholder:text-gray-400";

const selectCls =
  "px-3 py-2 rounded-xl border border-blue-100 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all";

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso + "T00:00:00"),
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</label>
      {children}
    </div>
  );
}

export default function StockMovement() {
  const {
    movements,
    allCount,
    products,
    form,
    formError,
    search,
    typeFilter,
    totals,
    setSearch,
    setTypeFilter,
    handleInputChange,
    handleSubmit,
    handleDelete,
  } = useMovements();
  const { notify } = useToast();
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  function onSubmit(e: React.FormEvent) {
    const ok = handleSubmit(e);
    if (ok) notify("Movimentação registrada e estoque atualizado.", "success");
  }

  const summary = [
    { label: "Entradas", value: totals.entradas, icon: ArrowUpCircle, cls: "text-green-600", bg: "bg-green-100" },
    { label: "Saídas", value: totals.saidas, icon: ArrowDownCircle, cls: "text-red-600", bg: "bg-red-100" },
    { label: "Saldo de unidades", value: totals.saldo, icon: ArrowLeftRight, cls: "text-blue-700", bg: "bg-blue-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 flex-shrink-0 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Movimentação de Estoque</h2>
          <p className="text-sm text-gray-500">
            Registre entradas e saídas — a quantidade do produto é atualizada automaticamente
          </p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon size={20} className={s.cls} />
              </div>
              <div>
                <p className={`text-2xl font-bold leading-none ${s.cls}`}>{s.value}</p>
                <p className="mt-1 text-xs font-medium text-gray-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulário */}
      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="h-1 bg-linear-to-r from-blue-700 via-amber-400 to-blue-500" />
        <div className="p-6">
          <h3 className="mb-4 text-base font-bold text-gray-900">Nova movimentação</h3>
          <form onSubmit={onSubmit}>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Produto">
                <select name="productId" value={form.productId} onChange={handleInputChange} className={`${inputCls} cursor-pointer`}>
                  <option value="">Selecionar...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.quantity} em estoque)
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tipo">
                <div className="flex gap-2">
                  {(["entrada", "saida"] as MovementType[]).map((t) => {
                    const active = form.type === t;
                    const isEntrada = t === "entrada";
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleInputChange({ target: { name: "type", value: t } } as never)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                          active
                            ? isEntrada
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {isEntrada ? <ArrowUpCircle size={15} /> : <ArrowDownCircle size={15} />}
                        {isEntrada ? "Entrada" : "Saída"}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Quantidade">
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={form.quantity}
                  onChange={handleInputChange}
                  className={inputCls}
                />
              </Field>

              <Field label="Motivo">
                <select name="reason" value={form.reason} onChange={handleInputChange} className={`${inputCls} cursor-pointer`}>
                  <option value="">Selecionar...</option>
                  {MOVEMENT_REASONS[form.type].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>

              <Field label={PARTY_LABELS[form.type]}>
                <input
                  name="party"
                  type="text"
                  value={form.party}
                  onChange={handleInputChange}
                  placeholder={form.type === "entrada" ? "Opcional — ex: Supermercado Família" : "Opcional — ex: Família atendida"}
                  className={inputCls}
                />
              </Field>

              <Field label="Data">
                <input name="date" type="date" value={form.date} onChange={handleInputChange} className={inputCls} />
              </Field>
            </div>

            <div className="flex items-center justify-between gap-4">
              <AnimatePresence>
                {formError && (
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium text-red-500"
                  >
                    {formError}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="ml-auto rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
              >
                Registrar movimentação
              </motion.button>
            </div>
          </form>
        </div>
      </section>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por produto ou motivo..."
            className="w-full rounded-xl border border-blue-100 bg-gray-50 py-2 pl-9 pr-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "" | MovementType)} className={selectCls}>
          <option value="">Todas as movimentações</option>
          <option value="entrada">Apenas entradas</option>
          <option value="saida">Apenas saídas</option>
        </select>
      </div>

      {/* Lista */}
      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
          <h3 className="text-base font-bold text-gray-900">Histórico de movimentações</h3>
          <span className="text-xs text-gray-400">
            {movements.length} de {allCount} {allCount === 1 ? "registro" : "registros"}
          </span>
        </div>

        {movements.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Nenhuma movimentação encontrada"
            description={
              allCount === 0
                ? "Registre a primeira entrada ou saída usando o formulário acima."
                : "Ajuste a busca ou o filtro para ver outros registros."
            }
          />
        ) : (
          <ul className="divide-y divide-gray-50">
            <AnimatePresence initial={false}>
              {movements.map((m) => {
                const isEntrada = m.type === "entrada";
                return (
                  <motion.li
                    key={m.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-center gap-3 px-6 py-3.5"
                  >
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                        isEntrada ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isEntrada ? <ArrowUpCircle size={17} /> : <ArrowDownCircle size={17} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{m.productName}</p>
                      <p className="truncate text-xs text-gray-500">
                        {m.reason}
                        {m.party && ` · ${isEntrada ? "de" : "para"} ${m.party}`} · {fmtDate(m.date)} · {m.user}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 text-sm font-bold ${isEntrada ? "text-green-600" : "text-red-600"}`}>
                      {isEntrada ? "+" : "−"}
                      {m.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(m.id)}
                      aria-label={`Excluir movimentação de ${m.productName}`}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir movimentação"
        message="A movimentação será removida e seu efeito no estoque será revertido. Deseja continuar?"
        confirmLabel="Excluir"
        onConfirm={() => {
          if (pendingDelete !== null) {
            handleDelete(pendingDelete);
            notify("Movimentação excluída e estoque revertido.", "info");
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
