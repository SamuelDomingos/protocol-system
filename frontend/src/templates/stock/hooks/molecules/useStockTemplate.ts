import { useState, useCallback, useEffect, useRef } from "react";
import { useProducts } from "../atoms/useProducts";
import { useLocations } from "../atoms/useLocations";
import { useMovements } from "../atoms/useMovements";
import { useFeedbackHandler } from "@/src/hooks/useFeedbackHandler";

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
    nearExpiryProducts: 0,
  });

  const [lowStockProductsData, setLowStockProductsData] = useState<any[]>([]);
  const [nearExpiryProductsData, setNearExpiryProductsData] = useState<any[]>([]);

  const { handleError } = useFeedbackHandler();

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

  const fetchLowStockProductsData = useCallback(async () => {
    try {
      const lowStock = await getLowStockProducts();
      setLowStockProductsData(lowStock?.data || []);
      return lowStock?.data || [];
    } catch (error) {
      handleError(error);
      return [];
    }
  }, [getLowStockProducts]);

  const fetchNearExpiryProductsData = useCallback(async () => {
    try {
      const nearExpiry = await getNearExpiryProducts();
      setNearExpiryProductsData(nearExpiry?.data || []);
      return nearExpiry?.data || [];
    } catch (error) {
      handleError(error);
      return [];
    }
  }, [getNearExpiryProducts]);

  useEffect(() => {
    fetchLowStockProductsData();
    fetchNearExpiryProductsData();
  }, [fetchLowStockProductsData, fetchNearExpiryProductsData]);

  useEffect(() => {
    setStockStats({
      totalProducts: products?.length || 0,
      lowStockProducts: lowStockProductsData?.length || 0,
      nearExpiryProducts: nearExpiryProductsData?.length || 0,
    });
  }, [products, lowStockProductsData, nearExpiryProductsData]);

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
    lowStockProductsData,
    nearExpiryProductsData,

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