import { Heart, Package } from "lucide-react";
import LogoMark from "./LogoMark";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-blue-100 bg-blue-700 text-blue-100">
      <div className="h-1 bg-linear-to-r from-blue-700 via-amber-400 to-blue-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Marca */}
          <div className="flex items-center gap-3">
            <LogoMark size={40} className="flex-shrink-0" />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-white text-lg leading-none tracking-tight">
                  AMA
                </span>
                <span className="text-blue-200 text-sm font-normal">Amigos Mãos Abertas</span>
              </div>
              <div className="mt-1 h-0.5 w-7 rounded-full bg-amber-400" />
            </div>
          </div>

          {/* Descrição */}
          <p className="max-w-xs text-center text-sm text-blue-200 sm:text-left">
            <span className="inline-flex items-center gap-1.5 font-medium text-white">
              <Package size={15} className="text-amber-400" />
              Sistema de Estoque
            </span>
            <br />
            Gestão simples e transparente de doações e suprimentos.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-blue-600/50 pt-6 text-xs text-blue-300 sm:flex-row sm:justify-between">
          <p>© {year} AMA — Amigos Mãos Abertas. Todos os direitos reservados.</p>
          <p className="inline-flex items-center gap-1.5">
            Feito com <Heart size={13} className="fill-amber-400 text-amber-400" /> para quem
            ajuda
          </p>
        </div>
      </div>
    </footer>
  );
}
