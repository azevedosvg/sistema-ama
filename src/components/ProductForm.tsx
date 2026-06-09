import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Gift, XCircle } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { isPerishable } from "../lib/productUtils";
import type { FieldErrors, FormData } from "../types/product";

export const CATEGORIES = [
  "Alimentos",
  "Bebidas",
  "Higiene e Limpeza",
  "Medicamentos",
  "Roupas",
  "Calçados",
  "Eletrônicos",
  "Brinquedos",
  "Móveis",
  "Utensílios Domésticos",
  "Material Escolar",
  "Outros",
];

type Props = {
  formData: FormData;
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  feedbackMessage: string;
  feedbackType: "success" | "error" | "";
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all placeholder:text-gray-400";

const errorInputClass =
  "w-full px-4 py-2.5 rounded-xl border border-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm transition-all";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
      {error && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 font-medium"
        >
          {error}
        </motion.span>
      )}
    </div>
  );
}

export default function ProductForm({
  formData,
  fieldErrors,
  isSubmitting,
  isEditing,
  feedbackMessage,
  feedbackType,
  onInputChange,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Checkbox doação */}
      <label className="inline-flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            name="isDonation"
            checked={formData.isDonation}
            onChange={onInputChange}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors" />
          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
        </div>
        <div className="flex items-center gap-2">
          <Gift size={15} className={formData.isDonation ? "text-blue-600" : "text-gray-400"} />
          <span className={`text-sm font-medium ${formData.isDonation ? "text-blue-700" : "text-gray-600"}`}>
            {formData.isDonation ? "Item de doação (preço não aplicável)" : "É uma doação?"}
          </span>
        </div>
      </label>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
          <Field label="Nome do item" error={fieldErrors.name}>
            <input
              name="name"
              type="text"
              placeholder="Ex: Camiseta Adulto M"
              value={formData.name}
              onChange={onInputChange}
              className={fieldErrors.name ? errorInputClass : inputClass}
            />
          </Field>

          <Field label="Categoria" error={fieldErrors.category}>
            <select
              name="category"
              value={formData.category}
              onChange={onInputChange}
              className={`${fieldErrors.category ? errorInputClass : inputClass} cursor-pointer`}
            >
              <option value="">Selecionar...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </Field>

          <Field label="Quantidade" error={fieldErrors.quantity}>
            <input
              name="quantity"
              type="number"
              placeholder="0"
              min="1"
              value={formData.quantity}
              onChange={onInputChange}
              className={fieldErrors.quantity ? errorInputClass : inputClass}
            />
          </Field>

          <Field label="Estoque mínimo" error={fieldErrors.minStock}>
            <input
              name="minStock"
              type="number"
              placeholder="0 (sem alerta)"
              min="0"
              value={formData.minStock}
              onChange={onInputChange}
              className={fieldErrors.minStock ? errorInputClass : inputClass}
              title="Quantidade a partir da qual o item é sinalizado como estoque baixo. Deixe 0 para não alertar."
            />
          </Field>

          <AnimatePresence mode="wait">
            {!formData.isDonation && (
              <motion.div
                key="unitCost"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <Field label="Custo unitário (R$)" error={fieldErrors.unitCost}>
                  <input
                    name="unitCost"
                    type="number"
                    placeholder="0,00"
                    step="0.01"
                    min="0.01"
                    value={formData.unitCost}
                    onChange={onInputChange}
                    className={fieldErrors.unitCost ? errorInputClass : inputClass}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isPerishable(formData.category) && (
              <motion.div
                key="expirationDate"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <Field label="Data de validade" error={fieldErrors.expirationDate}>
                  <input
                    name="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={onInputChange}
                    className={fieldErrors.expirationDate ? errorInputClass : inputClass}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditing
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            {isSubmitting
              ? isEditing ? "Salvando..." : "Cadastrando..."
              : isEditing ? "Salvar alterações" : "Cadastrar item"}
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
              feedbackType === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-600 border border-red-100"
            }`}
          >
            {feedbackType === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {feedbackMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
