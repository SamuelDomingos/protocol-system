"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { ArrowUp, ArrowDown, ArrowLeftRight, Package, User, Calendar, Info, MapPin } from "lucide-react";
import { formatDate } from "@/src/lib/utils";
import { useMovementDetailsData } from "../../hooks/molecules/useMovementDetailsData";
import { MovementDetailsList } from "../organelles/movement/lists/MovementDetailsList";

interface MovementsDetailsDialogProps {
  movementId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovementsDetailsDialog({ movementId, isOpen, onClose }: MovementsDetailsDialogProps) {
  const { movement, entries, loading, error } = useMovementDetailsData(movementId);

  const TypeIcon = () => {
    if (movement?.type === "entrada") return <ArrowUp className="h-5 w-5 text-green-500" />;
    if (movement?.type === "saida") return <ArrowDown className="h-5 w-5 text-red-500" />;
    return <ArrowLeftRight className="h-5 w-5 text-blue-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon />
            Detalhes da Movimentação
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-6">Carregando...</div>
        ) : error ? (
          <div className="p-6 text-destructive">{error}</div>
        ) : movement ? (
          <div className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <span>
                  {movement.type === "entrada"
                    ? "Entrada"
                    : movement.type === "saida"
                    ? "Saída"
                    : "Transferência"}
                  {movement.reason ? ` - ${movement.reason}` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Data:</span>
                <span>{formatDate(movement.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Usuário:</span>
                <span>{movement.user?.name || movement.userId || "-"}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Origem:</span>
                <span>{movement.fromLocation?.name || movement.fromLocationId || "-"}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Destino:</span>
                <span>{movement.toLocation?.name || movement.toLocationId || "-"}</span>
              </div>
            </div>

            <MovementDetailsList entries={entries} title="Itens da Movimentação" />

            {movement.notes && (
              <div className="mt-6 space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Observações:</span>{" "}
                  <span>{movement.notes}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">Selecione uma movimentação.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MovementsDetailsDialog;