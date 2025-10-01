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
import {StockLocation } from '@/src/lib/api/types/stock'
import { formatCurrency } from '@/src/lib/utils'

interface ProductLocationTabProps {
  locations: StockLocation[]
}

export function ProductLocationTab({ locations }: ProductLocationTabProps) {

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Quantidade por Localização</h4>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Localização</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Preço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length > 0 ? (
              locations.map(location => (
                <TableRow key={location.id}>
                  <TableCell>{location.locationName}</TableCell>
                  <TableCell>{location.totalQuantity}</TableCell>
                  <TableCell>{formatCurrency(location.totalPrice || 0)}</TableCell>
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