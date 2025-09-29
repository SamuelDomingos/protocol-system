import React, { useState } from "react";
import { useProducts } from "./hooks/molecules/useProducts";
import { useLocations } from "./hooks/molecules/useLocations";
import { useMovements } from "./hooks/molecules/useMovements";
import StockCard from "./components/organelles/StockCard";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/src/components/ui/tabs";
import { Loader2, Package, AlertTriangle, MapPin, Repeat } from "lucide-react";
import ProductsTable from "./components/atoms/ProductsTable";
import MovementsTable from "./components/atoms/MovementsTable";
import ProductDetailsDialog from "./components/molecules/ProductDetailsDialog";

export const StockTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = useState("produtos");
  const {
    products,
    loading: productsLoading,
    pagination: productsPagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    deleteProduct,
  } = useProducts();
  const {
    locations,
    loading: locationsLoading,
    pagination: locationsPagination,
  } = useLocations();
  const {
    movements,
    loading: movementsLoading,
    pagination: movementsPagination,
    searchTerm: movementsSearchTerm,
    setSearchTerm: setMovementsSearchTerm,
    fetchMovements,
  } = useMovements();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalProducts = products?.length || 0;
  const totalLocations = locations?.length || 0;
  const totalMovements = movements?.length || 0;

  const lowStockProducts =
    products?.filter((product) => product.quantity < product.minimumStock)
      .length || 0;

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

    const handleMovementClick = (movement: any) => {
    setSelectedMovement(movement);
    setIsDialogOpen(true);
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Gestão de Estoque</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div>
          <StockCard
            title="Total de Produtos"
            value={totalProducts}
            icon={<Package className="h-6 w-6" />}
            variant="success"
          />
        </div>
        <div>
          <StockCard
            title="Estoque Baixo"
            value={lowStockProducts}
            icon={<AlertTriangle className="h-6 w-6" />}
            variant="danger"
          />
        </div>
        <div>
          <StockCard
            title="Localizações"
            value={totalLocations}
            icon={<MapPin className="h-6 w-6" />}
            variant="success"
          />
        </div>
        <div>
          <StockCard
            title="Movimentações"
            value={totalMovements}
            icon={<Repeat className="h-6 w-6" />}
            variant="success"
          />
        </div>
      </div>

      <Tabs
        defaultValue="produtos"
        className="w-full"
        onValueChange={setActiveTab}
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
              products={products || []}
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
              \n <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando movimentações...</span>
            </div>
          ) : (
            <>
              <MovementsTable
                movements={movements || []}
                onRowClick={handleMovementClick}
                pagination={movementsPagination}
                searchTerm={movementsSearchTerm}
                setSearchTerm={setMovementsSearchTerm}
                fetchData={fetchMovements}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <ProductDetailsDialog
        product={selectedProduct}
        locations={locations || []}
        movements={movements || []}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};

export default StockTemplate;
