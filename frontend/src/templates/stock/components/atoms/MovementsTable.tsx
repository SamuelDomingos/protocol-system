"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { ArrowUp, ArrowDown, User, ArrowLeftRight } from "lucide-react";
import { formatDate } from "@/src/lib/utils";
import { PaginationControls } from "@/src/global/pagination/components/pagination-controls";
import { SearchInput } from "@/src/global/search/components/search-input";

import { MovementForm } from '../molecules/MovementForm';
import { MovementsTableProps, StockMovement } from "@/src/templates/stock/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";

export function MovementsTable({
  movements,
  onRowClick,
  pagination,
  searchTerm,
  setSearchTerm,
  fetchData,
}: MovementsTableProps) {
  const [isMovementFormOpen, setIsMovementFormOpen] = useState(false);
  const [selectedMovementType, setSelectedMovementType] = useState<StockMovement | undefined>(undefined);

  const handleOpenMovementForm = (type?: StockMovement) => {
    setSelectedMovementType(type);
    setIsMovementFormOpen(true);
  };

  const handleMovementFormSuccess = () => {
    fetchData();
    setIsMovementFormOpen(false);
  };

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Pesquisar movimentações..."
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
              <span>Movimentação</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleOpenMovementForm("entrada")} className="gap-2 text-green-600 hover:text-green-700">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span>Entrada</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenMovementForm("saida")} className="gap-2 text-red-600 hover:text-red-700">
              <ArrowDown className="h-4 w-4 text-red-500" />
              <span>Saída</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenMovementForm("transferencia")} className="gap-2 text-blue-600 hover:text-blue-700">
              <ArrowLeftRight className="h-4 w-4 text-blue-500" />
              <span>Transferência</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Usuário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length > 0 ? (
              movements.map((movement) => (
                <TableRow
                  key={movement.id}
                  onClick={() => onRowClick && onRowClick(movement)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  <TableCell>{formatDate(movement.createdAt || "")}</TableCell>
                  <TableCell>{movement.productName}</TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {movement.type === "entrada" ? (
                        <>
                          <ArrowUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">Entrada</span>
                        </>
                      ) : movement.type === "saida" ? (
                        <>
                          <ArrowDown className="h-4 w-4 text-red-500" />
                          <span className="text-red-500">Saída</span>
                        </>
                      ) : (
                        <>
                          <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-500">Transferência</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{movement.location?.location || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{movement.user?.name || "-"}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationControls pagination={pagination} />

      <MovementForm
        open={isMovementFormOpen}
        onOpenChange={setIsMovementFormOpen}
        onSuccess={handleMovementFormSuccess}
        initialType={selectedMovementType}
      />
    </div>
  );
}

export default MovementsTable;
