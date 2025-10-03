"use client";

import { useEffect, useState } from "react";
import { getStockMovementById } from "../../services/stockService";
import { StockMovementWithRelations, ProductEntry } from "../../types";

interface UseMovementDetailsDataReturn {
  movement: StockMovementWithRelations | null;
  entries: ProductEntry[];
  loading: boolean;
  error: string | null;
}

export function useMovementDetailsData(
  movementId: string | null
): UseMovementDetailsDataReturn {
  const [movement, setMovement] = useState<StockMovementWithRelations | null>(
    null
  );
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

        setMovement(baseMovement);

        const entry: ProductEntry = {
          id: `movement-entry-${movementId}`,
          productId: baseMovement.product?.id || "",
          productName: baseMovement.product?.name || "",
          quantity: baseMovement.quantity,
          batchNumber:
            baseMovement.fromLocation?.sku ||
            baseMovement.toLocation?.sku ||
            "",
          expiryDate: baseMovement.fromLocation?.expiryDate
            ? new Date(baseMovement.fromLocation.expiryDate)
            : baseMovement.toLocation?.expiryDate
            ? new Date(baseMovement.toLocation.expiryDate)
            : undefined,
          unitPrice: baseMovement.unitPrice || 0,
          totalValue:
            (baseMovement.quantity || 0) * (baseMovement.unitPrice || 0),
          destinationId: baseMovement.toLocation?.id || "",
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

  return { movement, entries, loading, error };
}

export default useMovementDetailsData;
