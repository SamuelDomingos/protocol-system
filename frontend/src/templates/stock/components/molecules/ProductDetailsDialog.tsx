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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/src/components/ui/table"
import { 
  Package, 
  Truck, 
  Banknote, 
  Calendar, 
  Tag, 
  Barcode, 
  Building, 
  Info, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeftRight,
  User
} from "lucide-react"
import { Product, StockLocation, StockMovement } from '@/src/lib/api/types/stock'
import { useProductDetails } from '../../hooks/organelles/useProductDetails'
import { formatCurrency, formatDate } from '@/src/lib/utils'

interface ProductDetailsDialogProps {
  product: Product | null
  locations: StockLocation[]
  movements: StockMovement[]
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailsDialog({ 
  product, 
  locations, 
  movements, 
  isOpen, 
  onClose 
}: ProductDetailsDialogProps) {
  const { 
    totalValue, 
    productMovements, 
    productLocations, 
    movementsByMonth, 
    hasData 
  } = useProductDetails(product, locations, movements)

  if (!hasData) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-4">Informações do Item</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Barcode className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">SKU:</span>
              <span>{product.sku}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Barcode className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Código de Barras:</span>
              <span>{product.barcode}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Categoria:</span>
              <span>{product.category}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Marca:</span>
              <span>{product.brand}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Preço Unitário:</span>
              <span>{formatCurrency(product.unitPrice)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Valor Total:</span>
              <span>{formatCurrency(totalValue)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estoque Mínimo:</span>
              <span>{product.minimumStock}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={product.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                {product.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Fornecedor:</span>
              <span>{product.supplier}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Data de Criação:</span>
              <span>{formatDate(product.createdAt || '')}</span>
            </div>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="estoque">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="estoque">Estoque</TabsTrigger>
                <TabsTrigger value="movimentacao">Movimentação</TabsTrigger>
                <TabsTrigger value="historico">Histórico de Consumo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="estoque" className="mt-4">
                <h4 className="text-sm font-medium mb-2">Quantidade por Localização</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Localização</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Preço</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.filter(loc => loc.productId === product.id).length > 0 ? (
                        locations
                          .filter(loc => loc.productId === product.id)
                          .map(location => (
                            <TableRow key={location.id}>
                              <TableCell>{location.location}</TableCell>
                              <TableCell>{location.quantity}</TableCell>
                              <TableCell>{location.sku}</TableCell>
                              <TableCell>{formatCurrency(location.price)}</TableCell>
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
              </TabsContent>
              
              <TabsContent value="movimentacao" className="mt-4">
                <h4 className="text-sm font-medium mb-2">Movimentações</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Usuário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productMovements.length > 0 ? (
                        productMovements.map(movement => (
                          <TableRow key={movement.id}>
                            <TableCell>{formatDate(movement.createdAt || '')}</TableCell>
                            <TableCell>{movement.reason}</TableCell>
                            <TableCell>{movement.quantity}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {movement.type === 'entrada' ? (
                                  <>
                                    <ArrowUp className="h-4 w-4 text-green-500" />
                                    <span className="text-green-500">Entrada</span>
                                  </>
                                ) : movement.type === 'saida' ? (
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
                            <TableCell>{movement.location?.location || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {movement.user?.name || '-'}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Nenhuma movimentação encontrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="historico" className="mt-4">
                <h4 className="text-sm font-medium mb-2">Histórico de Consumo</h4>
                
                <div className="mb-6">
                  <div className="h-64 w-full">
                    {/* Aqui seria implementado o gráfico de barras */}
                    <div className="flex h-full items-center justify-center border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">
                        Gráfico de histórico de consumo será implementado aqui
                      </p>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-sm font-medium mb-2">Resumo por Período</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Entradas</TableHead>
                        <TableHead>Saídas</TableHead>
                        <TableHead>Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.keys(movementsByMonth).length > 0 ? (
                        Object.entries(movementsByMonth).map(([monthYear, data]) => (
                          <TableRow key={monthYear}>
                            <TableCell>{monthYear}</TableCell>
                            <TableCell className="text-green-500">{data.entries}</TableCell>
                            <TableCell className="text-red-500">{data.exits}</TableCell>
                            <TableCell>{data.entries - data.exits}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            Nenhum histórico encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetailsDialog