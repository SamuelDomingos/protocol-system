"use client";

import { useEffect, useState } from "react";
import {
  getStockMovementById,
  getProductById,
  getStockLocationById,
} from "../../services/stockService";
import {
  StockMovementWithRelations,
  ProductEntry,
} from "../../types";

interface UseMovementDetailsDataReturn {
  movement: StockMovementWithRelations | null;
  entries: ProductEntry[];
  loading: boolean;
  error: string | null;
}

export function useMovementDetailsData(movementId: string | null): UseMovementDetailsDataReturn {
  const [movement, setMovement] = useState<StockMovementWithRelations | null>(null);
  const [entries, setEntries] = useState<ProductEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!movementId) {
        setMovement(null);
        setEntries([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const baseMovement = await getStockMovementById(movementId);

        const product = baseMovement.productId
          ? await getProductById(baseMovement.productId)
          : undefined;

        const fromLocation = baseMovement.fromLocationId
          ? await getStockLocationById(baseMovement.fromLocationId)
          : undefined;

        const toLocation = baseMovement.toLocationId
          ? await getStockLocationById(baseMovement.toLocationId)
          : undefined;

        const movementWithRelations: StockMovementWithRelations = {
          id: baseMovement.id,
          productId: baseMovement.productId,
          type: baseMovement.type,
          quantity: baseMovement.quantity,
          fromLocationId: baseMovement.fromLocationId,
          fromLocationType: baseMovement.fromLocationType,
          toLocationId: baseMovement.toLocationId,
          toLocationType: baseMovement.toLocationType,
          reason: baseMovement.reason,
          notes: baseMovement.notes,
          unitPrice: baseMovement.unitPrice,
          totalValue: baseMovement.totalValue,
          userId: baseMovement.userId,
          createdAt: baseMovement.createdAt,
          updatedAt: baseMovement.updatedAt,
          product: product,
          fromLocation: fromLocation ? { id: fromLocation.id, name: fromLocation.location } : undefined,
          toLocation: toLocation ? { id: toLocation.id, name: toLocation.location } : undefined,
          user: undefined, // Sem serviço de usuário aqui; podemos exibir userId
        };

        setMovement(movementWithRelations);

        // Preparar entrada única para exibição do "lista" somente leitura
        const entry: ProductEntry = {
          id: `movement-entry-${movementId}`,
          productId: baseMovement.productId,
          productName: product?.name || "",
          quantity: baseMovement.quantity,
          batchNumber: baseMovement.sku || "",
          expiryDate: baseMovement.expiryDate ? new Date(baseMovement.expiryDate) : undefined,
          unitPrice: baseMovement.unitPrice || 0,
          totalValue: (baseMovement.quantity || 0) * (baseMovement.unitPrice || 0),
          destinationId: baseMovement.toLocationId,
        };

        setEntries([entry]);
      } catch (err: any) {
        console.error("Erro ao carregar detalhes da movimentação:", err);
        setError("Não foi possível carregar os detalhes da movimentação.");
        setMovement(null);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [movementId]);

  return {
    movement,
    entries,
    loading,
    error,
  };
}

export default useMovementDetailsData;