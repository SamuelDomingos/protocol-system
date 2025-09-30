"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useConsumptionHistory } from '../../hooks/organelles/useConsumptionHistory'
import { ConsumptionHistoryChartProps } from '@/src/templates/stock/types/components'

export function ConsumptionHistoryChart({ movements, productId }: ConsumptionHistoryChartProps) {
  const { chartData, hasData } = useConsumptionHistory(movements, productId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Consumo</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entries" name="Entradas" fill="#10b981" />
              <Bar dataKey="exits" name="Saídas" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhum dado disponível para exibir
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ConsumptionHistoryChart