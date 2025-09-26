"use client"

import React from 'react';
import { Card, CardContent } from "@/src/components/ui/card";
import { useCardStyles } from '../../hooks/atoms/useCardStyles';

interface StockCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'danger';
}

export const StockCard: React.FC<StockCardProps> = ({ 
  title, 
  value, 
  icon, 
  variant = 'default' 
}) => {
  const { colorClass } = useCardStyles({ variant });

  return (
    <Card className="h-full flex flex-col">
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
  );
};

export default StockCard;