"use client";

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
import {
  Package,
  AlertTriangle
} from "lucide-react"
import { Product } from '@/src/lib/api/types/stock'
import { formatCurrency, formatDate } from '@/src/lib/utils'
import { PaginationControls } from '@/src/global/pagination/components/pagination-controls'
import { UsePaginationReturn } from '@/src/global/pagination/types/pagination'
import { SearchInput } from '@/src/global/search/components/search-input'
import { ProductForm } from '../molecules/ProductForm'
import { useSearch } from '@/src/global/search/hooks/use-search';

interface ProductsTableProps {
  products: Product[]
  onRowClick: (product: Product) => void
  pagination: UsePaginationReturn
}

export function ProductsTable({
  products,
  onRowClick,
  pagination,
}: ProductsTableProps) {
  const { searchTerm, setSearchTerm } = useSearch({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleNewProductClick = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
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
        <Button onClick={handleNewProductClick}>Novo Produto</Button>
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
                      {product.minimumStock > 0 && product.quantity < product.minimumStock && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={product.minimumStock > 0 && product.quantity < product.minimumStock ? "text-destructive font-medium" : ""}>
                    {product.quantity}
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>{product.minimumStock}</TableCell>
                  <TableCell>{formatCurrency(product.unitPrice * product.quantity)}</TableCell>
                  <TableCell>{formatDate(product.createdAt || '')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
    </div>
  )
}

export default ProductsTable;
