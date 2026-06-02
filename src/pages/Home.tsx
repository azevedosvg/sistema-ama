import { motion } from "framer-motion";
import { History, LogOut, Package, PackagePlus, Pencil, Wallet } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActivityLog from "../components/ActivityLog";
import BudgetPanel from "../components/BudgetPanel";
import Dashboard from "../components/Dashboard";
import Footer from "../components/Footer";
import ProductFilters from "../components/ProductFilters";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useAuth } from "../contexts/AuthContext";
import { useFinance } from "../hooks/useFinance";
import { useProducts } from "../hooks/useProducts";

type Tab = "estoque" | "financeiro" | "historico";

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-7 bg-amber-400 rounded-full flex-shrink-0" />
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("estoque");
  const finance = useFinance();
  const {
    dashboardData,
    editingProductId,
    formData,
    isSubmitting,
    feedbackMessage,
    feedbackType,
    fieldErrors,
    searchQuery,
    statusFilter,
    categoryFilter,
    sortOption,
    displayedProducts,
    visibleProducts,
    hasMore,
    showMore,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    setSortOption,
    handleInputChange,
    handleSubmitProduct,
    handleEditProduct,
    handleDeleteProduct,
  } = useProducts();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            onClick={() => setActiveTab("estoque")}
            aria-label="Ir para a página inicial"
            className="flex items-center gap-3 flex-shrink-0 rounded-xl px-1 py-1 -mx-1 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span className="text-2xl select-none">🤲</span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-white text-lg leading-none tracking-tight">AMA</span>
                <span className="hidden lg:inline text-blue-200 text-sm font-normal">
                  Amigos Mãos Abertas
                </span>
              </div>
              <div className="w-7 h-0.5 bg-amber-400 rounded-full mt-1" />
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Navigation */}
            <nav className="flex items-center gap-1 p-1 bg-blue-800/50 rounded-xl">
              {(
                [
                  { id: "estoque",    label: "Estoque",    icon: Package },
                  { id: "financeiro", label: "Financeiro", icon: Wallet  },
                  { id: "historico",  label: "Histórico",  icon: History },
                ] as { id: Tab; label: string; icon: React.ElementType }[]
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  title={label}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === id ? "text-blue-900" : "text-blue-100 hover:text-white"
                  }`}
                >
                  {activeTab === id && (
                    <motion.span
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-amber-400 rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={16} className="relative flex-shrink-0" />
                  <span className="relative hidden md:inline">{label}</span>
                </button>
              ))}
            </nav>

            {/* Divider */}
            <div className="w-px h-7 bg-blue-500/60" />

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-600 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === "estoque" && (
          <>
            {/* Dashboard */}
            {dashboardData && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SectionTitle title="Visão Geral" sub="Resumo atual do estoque" />
                <Dashboard data={dashboardData} />
              </motion.section>
            )}

            {/* Form section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden"
            >
              <div className="h-1 bg-linear-to-r from-blue-700 via-amber-400 to-blue-500" />
              <div className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-700 to-blue-800 shadow-sm">
                    {editingProductId !== null ? (
                      <Pencil size={20} className="text-white" />
                    ) : (
                      <PackagePlus size={20} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingProductId !== null ? "Editar Produto" : "Cadastrar Produto"}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {editingProductId !== null
                        ? "Atualize as informações do produto selecionado"
                        : "Preencha os dados para adicionar um novo item ao estoque"}
                    </p>
                    <div className="mt-1.5 h-0.5 w-8 rounded-full bg-amber-400" />
                  </div>
                </div>
                <ProductForm
                  formData={formData}
                  fieldErrors={fieldErrors}
                  isSubmitting={isSubmitting}
                  isEditing={editingProductId !== null}
                  feedbackMessage={feedbackMessage}
                  feedbackType={feedbackType}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmitProduct}
                />
              </div>
            </motion.section>

            {/* Product list section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <SectionTitle
                title="Produtos"
                sub={`${displayedProducts.length} ${displayedProducts.length === 1 ? "item encontrado" : "itens encontrados"}`}
              />
              <ProductFilters
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                categoryFilter={categoryFilter}
                sortOption={sortOption}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onCategoryChange={setCategoryFilter}
                onSortChange={setSortOption}
                onClearFilters={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                  setCategoryFilter("");
                  setSortOption("");
                }}
              />
              <ProductList
                products={visibleProducts}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                hasMore={hasMore}
                remainingCount={displayedProducts.length - visibleProducts.length}
                onShowMore={showMore}
              />
            </motion.section>
          </>
        )}

        {activeTab === "financeiro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BudgetPanel
              summary={finance.summary}
              transactions={finance.transactions}
              showForm={finance.showForm}
              formData={finance.formData}
              formError={finance.formError}
              setShowForm={finance.setShowForm}
              onInputChange={finance.handleInputChange}
              onSubmit={finance.handleSubmit}
              onDelete={finance.handleDelete}
            />
          </motion.div>
        )}

        {activeTab === "historico" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ActivityLog />
          </motion.div>
        )}
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
