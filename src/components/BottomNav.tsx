import { motion } from "framer-motion";
import type { HomeTab } from "../pages/Home";

export type BottomNavTab = { id: HomeTab; label: string; icon: React.ElementType };

type Props = {
  tabs: BottomNavTab[];
  activeTab: HomeTab;
  onSelect: (tab: HomeTab) => void;
};

// Navegação inferior fixa para telas pequenas (até xl). No desktop, o menu do header assume.
export default function BottomNav({ tabs, activeTab, onSelect }: Props) {
  return (
    <nav
      aria-label="Navegação principal (mobile)"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-blue-100 bg-white/95 backdrop-blur-sm shadow-[0_-2px_12px_rgba(0,0,0,0.06)] xl:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch gap-0.5 overflow-x-auto px-1 no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex w-full min-w-[58px] flex-col items-center gap-1 px-1.5 py-2 text-[10px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  active ? "text-blue-700" : "text-gray-500 hover:text-blue-600"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-amber-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={20} className="flex-shrink-0" />
                <span className="leading-none">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
