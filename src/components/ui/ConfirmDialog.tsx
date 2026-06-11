/* ============================================================================
 * 🎤 APRESENTAÇÃO · INTEGRANTE 8 — Design System & Componentes-base
 * PASSO 2 do roteiro: "O diálogo de confirmação" (~0:40–1:40)
 *
 * O que falar: ele recebe open, title, message, onConfirm e onCancel —
 * é GENÉRICO, serve para qualquer confirmação do sistema. Substitui o
 * window.confirm nativo por um modal bonito e consistente; é ele que aparece
 * na exclusão de produto (Integrante 2).
 *
 * 🗣️ Fala sugerida: "Quando você exclui um produto, aquele modal de 'tem
 * certeza?' é meu. Eu o fiz genérico: recebe título, mensagem e o que fazer
 * ao confirmar, então serve pra qualquer confirmação do sistema."
 * ========================================================================== */
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "./Modal";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" usa vermelho (exclusões); "primary" usa azul */
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

// Diálogo de confirmação — substitui window.confirm por algo acessível e estilizado
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  onConfirm,
  onCancel,
}: Props) {
  const confirmCls =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-blue-700 hover:bg-blue-800 text-white";
  const iconCls = tone === "danger" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700";

  return (
    <Modal open={open} title={title} onClose={onCancel} maxWidth="max-w-md">
      <div className="flex gap-4">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${iconCls}`}>
          <AlertTriangle size={20} />
        </div>
        <p className="pt-1 text-sm leading-relaxed text-gray-600">{message}</p>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {cancelLabel}
        </button>
        <motion.button
          type="button"
          onClick={onConfirm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${confirmCls}`}
        >
          {confirmLabel}
        </motion.button>
      </div>
    </Modal>
  );
}
