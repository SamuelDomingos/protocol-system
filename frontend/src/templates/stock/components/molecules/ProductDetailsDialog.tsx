"use client"

import React from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/src/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { 
  Package, 
  Banknote, 
  Calendar, 
  Tag, 
  Info
} from "lucide-react"
import { Product } from '@/src/lib/api/types/stock'
import { useProductDetailsData } from '../../hooks/atoms/useProductDetailsData'
import { formatCurrency, formatDate } from '@/src/lib/utils'
import { ProductLocationTab } from '../organelles/ProductDetailsDialog/ProductLocationTab'
import { ProductMovementTab } from '../organelles/ProductDetailsDialog/ProductMovementTab'
import { ProductConsumptionHistoryTab } from '../organelles/ProductDetailsDialog/ProductConsumptionHistoryTab'

interface ProductDetailsDialogProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailsDialog({ 
  product, 
  isOpen, 
  onClose 
}: ProductDetailsDialogProps) {
  const { 
    locations,
    movements,
    movementsLoading,
    movementsPagination
  } = useProductDetailsData(product?.id)

  const totalValue = product?.totalPrice || 0

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-4">Informações do Item</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Categoria:</span>
              <span>{product?.category}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Valor Total:</span>
              <span>{formatCurrency(totalValue)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Criado em:</span>
              <span>{formatDate(product?.createdAt)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                product?.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product?.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="estoque" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="estoque">Estoque</TabsTrigger>
                <TabsTrigger value="movimentacao">Movimentação</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="estoque" className="mt-4">
                <ProductLocationTab product={product} locations={locations} />
              </TabsContent>
              
              <TabsContent value="movimentacao" className="mt-4">
                <ProductMovementTab 
                  movements={movements} 
                  loading={movementsLoading}
                  pagination={movementsPagination}
                />
              </TabsContent>
              
              <TabsContent value="historico" className="mt-4">
                <ProductConsumptionHistoryTab product={product} movements={movements} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetailsDialog