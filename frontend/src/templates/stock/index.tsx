'use client'

import React from "react";
import StockCard from "./components/organelles/StockCard";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/src/components/ui/tabs";
import { Loader2, Package, AlertTriangle, Repeat } from "lucide-react";
import ProductsTable from "./components/atoms/ProductsTable";
import MovementsTable from "./components/atoms/MovementsTable";
import ProductDetailsDialog from "./components/molecules/ProductDetailsDialog";
import { useStockTemplate } from "./hooks/atoms/useStockTemplate";

export const StockTemplate: React.FC = () => {
  const {

    activeTab,
    handleTabChange,

    products,
    productsLoading,
    productsPagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    deleteProduct,
    movements,
    movementsLoading,
    movementsPagination,
    movementsSearchTerm,
    setMovementsSearchTerm,
    fetchMovements,
    lowStockProductsData,
    nearExpiryProductsData,

    stockStats,
    
    selectedProduct,
    isDialogOpen,
    handleProductClick,
    handleMovementClick,
    handleCloseDialog,
  } = useStockTemplate();

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Gestão de Estoque</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StockCard
          title="Total de Produtos"
          value={stockStats.totalProducts}
          icon={<Package className="h-6 w-6" />}
          variant="success"
        />
        <StockCard
          title="Estoque Baixo"
          value={stockStats.lowStockProducts}
          data={lowStockProductsData}
          icon={<AlertTriangle className="h-6 w-6" />}
          variant="danger"
        />
        <StockCard
          title="Produtos Próximos do Vencimento"
          value={stockStats.nearExpiryProducts}
          data={nearExpiryProductsData}
          icon={<Repeat className="h-6 w-6" />}
          variant="warning"
        />
      </div>

      <Tabs
        defaultValue="produtos"
        className="w-full"
        onValueChange={handleTabChange}
        value={activeTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Gerenciamento de Produtos
          </h2>
          {productsLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando produtos...</span>
            </div>
          ) : (
            <ProductsTable
              products={products}
              onRowClick={handleProductClick}
              pagination={productsPagination}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              fetchData={fetchData}
              deleteProduct={deleteProduct}
            />
          )}
        </TabsContent>

        <TabsContent value="movimentacoes" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Gerenciamento de Movimentações
          </h2>
          {movementsLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando movimentações...</span>
            </div>
          ) : (
            <MovementsTable
              movements={movements}
              onRowClick={handleMovementClick}
              pagination={movementsPagination}
              searchTerm={movementsSearchTerm}
              setSearchTerm={setMovementsSearchTerm}
              fetchData={fetchMovements}
            />
          )}
        </TabsContent>
      </Tabs>

      <ProductDetailsDialog
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default StockTemplate;