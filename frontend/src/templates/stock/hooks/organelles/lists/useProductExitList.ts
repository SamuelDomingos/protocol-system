import { useState, useEffect, useCallback } from 'react';
import { ProductEntry } from '../../../types';
import { 
  getProductsByLocation, 
  getBatchesByProductAndLocation 
} from '@/src/templates/stock/services/stockService';
import { ProductWithStock } from '@/src/lib/api/types';

interface UseExitProductListProps {
  locationId: string;
  entries: ProductEntry[];
  onEntriesChange: (entries: ProductEntry[]) => void;
  exitType: string;
}

interface ProductOption {
  value: string;
  label: string;
}

interface BatchInfo {
  id: string;
  sku: string;
  quantity: number;
  expiryDate?: string;
  price: number;
  product: {
    name: string;
    unitPrice: number;
  };
}

export function useExitProductList({ 
  locationId, 
  entries, 
  onEntriesChange,
}: UseExitProductListProps) {
  const [filteredProducts, setFilteredProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<ProductWithStock[]>([]);
  const [batchesData, setBatchesData] = useState<{ [productId: string]: BatchInfo[] }>({});

  // Buscar produtos disponíveis no local
  const fetchProducts = useCallback(async () => {
    if (!locationId) {
      setFilteredProducts([]);
      setStockData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getProductsByLocation(locationId);
      const products = response || [];
      
      setStockData(products);
      setFilteredProducts(
        products.map((product: ProductWithStock) => ({
          value: product.productId,
          label: `${product.product.name}`,
        }))
      );
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setFilteredProducts([]);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  const fetchBatchesForProduct = useCallback(async (productId: string) => {
    if (!productId || !locationId) return;

    try {
      const batches = await getBatchesByProductAndLocation(productId, locationId);
      setBatchesData(prev => ({
        ...prev,
        [productId]: batches
      }));
    } catch (error) {
      console.error('Erro ao buscar lotes:', error);
    }
  }, [locationId]);

  const getMaxQuantityForProduct = useCallback((productId: string): number => {
    const batches = batchesData[productId] || [];
    return batches.reduce((total, batch) => total + batch.quantity, 0);
  }, [batchesData]);

  const getBatchesForProduct = useCallback((productId: string): BatchInfo[] => {
    return batchesData[productId] || [];
  }, [batchesData]);

  // Adicionar nova entrada
  const addNewEntry = useCallback(() => {
    const newEntry: ProductEntry = {
      id: `entry-${Date.now()}`,
      productId: '',
      productName: '',
      quantity: 0,
      batchNumber: '',
      expiryDate: undefined,
      unitPrice: 0,
      totalValue: 0,
    };
    
    const newEntries = [...entries, newEntry];
    onEntriesChange(newEntries);
  }, [entries, onEntriesChange]);

  // Remover entrada
  const removeEntry = useCallback((index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onEntriesChange(newEntries);
  }, [entries, onEntriesChange]);

  // Atualizar entrada
  const updateEntry = useCallback((index: number, field: keyof ProductEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value,
    };

    // Recalcular valor total quando quantidade ou preço unitário mudar
    if (field === 'quantity' || field === 'unitPrice') {
      newEntries[index].totalValue = newEntries[index].quantity * newEntries[index].unitPrice;
    }

    onEntriesChange(newEntries);
  }, [entries, onEntriesChange]);

  // Selecionar produto
  const selectProduct = useCallback(async (index: number, productId: string) => {
    const product = stockData.find(p => p.productId === productId);
    if (product) {
      const newEntries = [...entries];
      newEntries[index] = {
        ...newEntries[index],
        productId,
        productName: product.product.name,
        unitPrice: product.product.unitPrice || 0,
        totalValue: newEntries[index].quantity * (product.product.unitPrice || 0),
        batchNumber: '',
        expiryDate: undefined,
      };
      onEntriesChange(newEntries);
      
      // Buscar lotes para este produto
      await fetchBatchesForProduct(productId);
    }
  }, [stockData, entries, onEntriesChange, fetchBatchesForProduct]);

  // Selecionar lote
  const selectBatch = useCallback((index: number, batchInfo: BatchInfo) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      batchNumber: batchInfo.sku,
      expiryDate: batchInfo.expiryDate ? new Date(batchInfo.expiryDate) : undefined,
      unitPrice: batchInfo.price,
      totalValue: newEntries[index].quantity * batchInfo.price,
    };
    onEntriesChange(newEntries);
  }, [entries, onEntriesChange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    filteredProducts,
    getMaxQuantityForProduct,
    getBatchesForProduct,
    loading,
    addNewEntry,
    removeEntry,
    updateEntry,
    selectProduct,
    selectBatch,
    destinationOptions: [],
  };
}