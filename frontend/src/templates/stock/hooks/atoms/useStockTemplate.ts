import { useState, useCallback, useEffect, useRef } from "react";
import { useProducts } from "../molecules/useProducts";
import { useLocations } from "../molecules/useLocations";
import { useMovements } from "../molecules/useMovements";

interface TabCache {
  produtos: boolean;
  movimentacoes: boolean;
}

export function useStockTemplate() {
  const [activeTab, setActiveTab] = useState("produtos");
  const [tabCache, setTabCache] = useState<TabCache>({
    produtos: true,
    movimentacoes: false,
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stockStats, setStockStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    nearExpiryProducts: 0
  });

  const initializedRef = useRef(false);

  const {
    products,
    loading: productsLoading,
    pagination: productsPagination,
    searchTerm: productsSearchTerm,
    setSearchTerm: setProductsSearchTerm,
    fetchData: fetchProducts,
    getLowStockProducts,
    getNearExpiryProducts,
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

  // Atualizar o número total de produtos quando products mudar
  useEffect(() => {
    setStockStats(prev => ({
      ...prev,
      totalProducts: products?.length || 0
    }));
  }, [products]);

  useEffect(() => {
    async function loadStockStats() {
      try {
        const lowStock = await getLowStockProducts();
        const nearExpiry = await getNearExpiryProducts();

        setStockStats(prev => ({
          ...prev,
          lowStockProducts: lowStock?.data?.length || 0,
          nearExpiryProducts: nearExpiry?.data?.length || 0
        }));
      } catch (error) {
        console.error("Erro ao carregar estatísticas de estoque:", error);
      }
    }
    
    if (products?.length > 0) {
      loadStockStats();
    }
  }, [getLowStockProducts, getNearExpiryProducts, products]);

  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);

    setTabCache(prev => {
      if (!prev[newTab as keyof TabCache]) {
        return {
          ...prev,
          [newTab]: true,
        };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    if (activeTab === "movimentacoes" && !tabCache.movimentacoes) {
      fetchMovements();
    }
  }, [activeTab, tabCache.movimentacoes, fetchMovements]);

  const handleProductClick = useCallback((product: any) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  }, []);

  const handleMovementClick = useCallback((movement: any) => {
    setSelectedMovement(movement);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
    setSelectedMovement(null);
  }, []);

  const refreshCurrentTab = useCallback(() => {
    if (activeTab === "produtos") {
      fetchProducts();
    } else if (activeTab === "movimentacoes") {
      fetchMovements();
    }
  }, [activeTab, fetchProducts, fetchMovements]);

  const shouldShowProductsLoading = productsLoading && activeTab === "produtos";
  const shouldShowMovementsLoading =
    movementsLoading &&
    activeTab === "movimentacoes" &&
    !tabCache.movimentacoes;

  const currentSearchTerm =
    activeTab === "produtos" ? productsSearchTerm : movementsSearchTerm;
  const setCurrentSearchTerm =
    activeTab === "produtos" ? setProductsSearchTerm : setMovementsSearchTerm;

  return {
    activeTab,
    handleTabChange,

    products: products || [],
    productsLoading: shouldShowProductsLoading,
    productsPagination,
    searchTerm: currentSearchTerm,
    setSearchTerm: setCurrentSearchTerm,
    fetchData: fetchProducts,
    deleteProduct,

    locations: locations || [],
    locationsLoading,
    locationsPagination,

    movements: movements || [],
    movementsLoading: shouldShowMovementsLoading,
    movementsPagination,
    movementsSearchTerm,
    setMovementsSearchTerm,
    fetchMovements,

    stockStats,

    // Dialog handlers
    selectedProduct,
    selectedMovement,
    isDialogOpen,
    handleProductClick,
    handleMovementClick,
    handleCloseDialog,

    // Utilitários
    refreshCurrentTab,
    tabCache,
  };
}