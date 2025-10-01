"use client"

import React, { useState } from 'react';
import { Card, CardContent } from "@/src/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { useCardStyles } from '../../hooks/atoms/useCardStyles';
import { StockCardProps } from '../../types/components';
import { Calendar, Package, AlertTriangle, Clock } from 'lucide-react';

import {formatDate} from '@/src/lib/utils';

export const StockCard: React.FC<StockCardProps> = ({
  title,
  value,
  icon,
  variant = 'default',
  data,
}) => {
  const { colorClass } = useCardStyles({ variant });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCardClick = () => {
    if (data && data.length > 0) {
      setIsDialogOpen(true);
    }
  };

  const getUrgencyBadgeVariant = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getUrgencyLabel = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return urgencyLevel;
    }
  };

  return (
    <>
      <Card 
        className={`h-full flex flex-col ${data && data.length > 0 ? 'cursor-pointer' : ''}`} 
        onClick={data && data.length > 0 ? handleCardClick : undefined}
      >
        <CardContent className="flex-grow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-muted-foreground">
              {title}
            </h3>
            <div className={colorClass}>
              {icon}
            </div>
          </div>
          <div className="text-3xl font-bold">
            {value}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {icon}
              {title}
            </DialogTitle>
            <DialogDescription>
              Detalhes dos produtos - Total: {data?.length || 0} itens
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {data?.map((item, index) => (
              <div key={item.id || index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {item.product?.name || 'Produto sem nome'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Lote: {item.sku} | Categoria: {item.product?.category || 'N/A'}
                    </p>
                  </div>
                  {item.urgencyLevel && (
                    <Badge variant={getUrgencyBadgeVariant(item.urgencyLevel)}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {getUrgencyLabel(item.urgencyLevel)}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground">Quantidade</p>
                    <p className="font-semibold">{item.quantity} {item.product?.unit || 'unidades'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground">Estoque Mínimo</p>
                    <p className="font-semibold">{item.product?.minimumStock || 'N/A'}</p>
                  </div>

                  {item.expiryDate && (
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Data de Vencimento
                      </p>
                      <p className="font-semibold">{formatDate(item.expiryDate)}</p>
                    </div>
                  )}

                  {item.daysUntilExpiry !== undefined && (
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Dias até Vencer
                      </p>
                      <p className={`font-semibold ${item.daysUntilExpiry <= 30 ? 'text-red-600' : item.daysUntilExpiry <= 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {item.daysUntilExpiry} dias
                      </p>
                    </div>
                  )}
                </div>

                {item.totalValue !== undefined && item.totalValue > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      <span className="font-medium text-muted-foreground">Valor Total: </span>
                      <span className="font-semibold">R$ {item.totalValue.toFixed(2)}</span>
                    </p>
                  </div>
                )}

                {item.isExpired && (
                  <div className="pt-2">
                    <Badge variant="destructive" className="w-full justify-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      PRODUTO VENCIDO
                    </Badge>
                  </div>
                )}
              </div>
            ))}

            {(!data || data.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StockCard;