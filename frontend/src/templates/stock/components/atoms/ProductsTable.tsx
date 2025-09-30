"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Package, AlertTriangle, MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Product } from "@/src/lib/api/types/stock";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { PaginationControls } from "@/src/global/pagination/components/pagination-controls";
import { SearchInput } from "@/src/global/search/components/search-input";
import { ProductForm } from "../molecules/ProductForm";
import { DeleteConfirmationDialog } from "../molecules/DeleteConfirmationDialog";

import { ProductsTableProps } from "@/src/templates/stock/types";

export function ProductsTable({
  products,
  onRowClick,
  pagination,
  searchTerm,
  setSearchTerm,
  fetchData,
  deleteProduct,
}: ProductsTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    fetchData();
  };

  const handleNewProductClick = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      fetchData();
    }
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Pesquisar produtos..."
          className="max-w-sm"
        />
        <Button onClick={handleNewProductClick} variant="outline" className="gap-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span>Novo Produto</span>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Estoque Mínimo</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  onClick={() => onRowClick(product)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{product.name}</span>
                      {product.minimumStock > 0 &&
                        product.quantity < product.minimumStock && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={
                      product.minimumStock > 0 &&
                      product.quantity < product.minimumStock
                        ? "text-destructive font-medium"
                        : ""
                    }
                  >
                    {product.quantity}
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>{product.minimumStock}</TableCell>
                  <TableCell>
                    {formatCurrency(product.unitPrice * product.quantity)}
                  </TableCell>
                  <TableCell>{formatDate(product.createdAt || "")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedProduct(product);
                            setIsFormOpen(true);
                          }}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteClick(product);
                          }}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {"Nenhum produto encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls pagination={pagination} />

      <ProductForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedProduct}
        onSuccess={handleFormClose}
        onCancel={handleFormClose}
      />

      {productToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          productName={productToDelete.name}
        />
      )}
    </div>
  );
}

export default ProductsTable;
