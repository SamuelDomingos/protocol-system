"use client";

import React from "react";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { ProductEntry } from "@/src/templates/stock/types";

interface MovementDetailsListProps {
  entries: ProductEntry[];
  title?: string;
}

export function MovementDetailsList({ entries, title = "Produtos Movimentados" }: MovementDetailsListProps) {
  console.log(entries);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nenhum produto movimentado</div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            return (
              <div key={entry.id} className="border rounded-lg p-4 bg-card">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-6">
                  <div className="col-span-1 md:col-span-2">
                    <Label>Produto</Label>
                    <Input value={entry.productName} readOnly className="bg-muted/50 text-muted-foreground" />
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <Label>Qtd Movimentada</Label>
                    <Input value={String(entry.quantity)} readOnly className="bg-muted/50 text-muted-foreground" />
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <Label>Lote</Label>
                    <Input value={entry.batchNumber || ""} readOnly className="bg-muted/50 text-muted-foreground" />
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <Label>Validade</Label>
                    <Input
                      value={entry.expiryDate ? entry.expiryDate.toLocaleDateString("pt-BR") : "-"}
                      readOnly
                      className="bg-muted/50 text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MovementDetailsList;