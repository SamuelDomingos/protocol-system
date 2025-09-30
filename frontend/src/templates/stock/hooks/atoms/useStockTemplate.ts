import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useProducts } from "../molecules/useProducts";
import { useLocations } from "../molecules/useLocations";
import { useMovements } from "../molecules/useMovements";

// Interface para controle de cache
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
  
  // Ref para controlar se já foi inicializado
  const initializedRef = useRef(false);

  // Hooks condicionais baseados no cache e aba ativa
  const shouldLoadProducts = tabCache.produtos;
  const shouldLoadMovements = tabCache.movimentacoes;

  const {
    products,
    loading: productsLoading,
    pagination: productsPagination,
    searchTerm: productsSearchTerm,
    setSearchTerm: setProductsSearchTerm,
    fetchData: fetchProducts,
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

  // Memoização dos cálculos para evitar recálculos desnecessários
  const stockStats = useMemo(() => {
    const totalProducts = products?.length || 0;
    const totalLocations = locations?.length || 0;
    const totalMovements = movements?.length || 0;
    const lowStockProducts = products?.filter((product) => product.quantity < product.minimumStock).length || 0;

    return {
      totalProducts,
      totalLocations,
      totalMovements,
      lowStockProducts,
    };
  }, [products, locations, movements]);

  // Função para gerenciar o cache das abas
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
    
    // Marcar a aba como carregada no cache apenas se ainda não foi carregada
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

  // Carregar dados apenas quando necessário
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    // Só carregar movimentações quando a aba for acessada pela primeira vez
    if (activeTab === "movimentacoes" && !tabCache.movimentacoes) {
      fetchMovements();
    }
  }, [activeTab, tabCache.movimentacoes, fetchMovements]);

  // Handlers para produtos
  const handleProductClick = useCallback((product: any) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  }, []);

  // Handlers para movimentações
  const handleMovementClick = useCallback((movement: any) => {
    setSelectedMovement(movement);
    setIsDialogOpen(true);
  }, []);

  // Handler para fechar dialog
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
    setSelectedMovement(null);
  }, []);

  // Função para forçar atualização de dados
  const refreshCurrentTab = useCallback(() => {
    if (activeTab === "produtos") {
      fetchProducts();
    } else if (activeTab === "movimentacoes") {
      fetchMovements();
    }
  }, [activeTab, fetchProducts, fetchMovements]);

  // Verificar se deve mostrar loading (apenas na primeira carga)
  const shouldShowProductsLoading = productsLoading && activeTab === "produtos";
  const shouldShowMovementsLoading = movementsLoading && activeTab === "movimentacoes" && !tabCache.movimentacoes;

  // Determinar qual searchTerm usar baseado na aba ativa
  const currentSearchTerm = activeTab === "produtos" ? productsSearchTerm : movementsSearchTerm;
  const setCurrentSearchTerm = activeTab === "produtos" ? setProductsSearchTerm : setMovementsSearchTerm;

  return {
    // Estado das abas
    activeTab,
    handleTabChange,
    
    // Dados dos produtos
    products: products || [],
    productsLoading: shouldShowProductsLoading,
    productsPagination,
    searchTerm: currentSearchTerm,
    setSearchTerm: setCurrentSearchTerm,
    fetchData: fetchProducts,
    deleteProduct,
    
    // Dados das localizações
    locations: locations || [],
    locationsLoading,
    locationsPagination,
    
    // Dados das movimentações
    movements: movements || [],
    movementsLoading: shouldShowMovementsLoading,
    movementsPagination,
    movementsSearchTerm,
    setMovementsSearchTerm,
    fetchMovements,
    
    // Estatísticas
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