import { motion } from "framer-motion";
import { ChevronDown, PackageSearch } from "lucide-react";
import type { Product } from "../types/product";
import ProductCard from "./ProductCard";

type Props = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  hasMore?: boolean;
  remainingCount?: number;
  onShowMore?: () => void;
};

export default function ProductList({
  products,
  onEdit,
  onDelete,
  hasMore = false,
  remainingCount = 0,
  onShowMore,
}: Props) {
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-gray-400"
      >
        <PackageSearch size={48} strokeWidth={1.2} className="mb-3 text-gray-300" />
        <p className="font-medium text-gray-500">Nenhum produto encontrado</p>
        <p className="text-sm mt-1">Tente ajustar os filtros ou cadastre um novo produto.</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className="h-full"
          >
            <ProductCard product={product} onEdit={onEdit} onDelete={onDelete} />
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <motion.button
            type="button"
            onClick={onShowMore}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <ChevronDown size={16} />
            Ver mais
            {remainingCount > 0 && (
              <span className="text-blue-400">({remainingCount} restantes)</span>
            )}
          </motion.button>
        </div>
      )}
    </>
  );
}
