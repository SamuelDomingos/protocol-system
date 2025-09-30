"use client"

import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/src/components/ui/table"
import { Product, StockLocation } from '@/src/lib/api/types/stock'
import { formatCurrency } from '@/src/lib/utils'

interface ProductLocationTabProps {
  product: Product | null
  locations: StockLocation[]
}

export function ProductLocationTab({ product, locations }: ProductLocationTabProps) {
  const productLocations = locations.filter(loc => loc.productId === product?.id)
  
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Quantidade por Localização</h4>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Localização</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Preço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productLocations.length > 0 ? (
              productLocations.map(location => (
                <TableRow key={location.id}>
                  <TableCell>{location.supplierLocation?.name}</TableCell>
                  <TableCell>{location.quantity}</TableCell>
                  <TableCell>{location.sku}</TableCell>
                  <TableCell>{formatCurrency(location.price || 0)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhuma localização encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ProductLocationTab