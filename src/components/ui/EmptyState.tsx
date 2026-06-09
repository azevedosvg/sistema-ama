import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

// Estado vazio padrão — usado quando uma lista/filtro não tem resultados
export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-6 py-14 text-center"
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
        <Icon size={26} className="text-blue-300" />
      </div>
      <p className="text-sm font-semibold text-gray-600">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
