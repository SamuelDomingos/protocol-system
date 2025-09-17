"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  DollarSign,
  LineChart as LineChartIcon,
  Loader2,
  Users,
  Activity,
  BookTemplate,
  BarChart3,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { protocolsService } from "@/services/protocols-api"
import { clientsService } from "@/services/clients-api"
import { applicationsService } from "@/services/applications-api"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Componente para gráfico de barras
const BarChart = ({
  data,
  title,
  compareData = null,
  showValues = true,
  formatValue = (value) => value.toString(),
}: {
  data: { name: string; value: number }[]
  title: string
  compareData?: { name: string; value: number }[] | null
  showValues?: boolean
  formatValue?: (value: number) => string
}) => {
  // Encontrar o valor máximo para calcular a altura das barras
  const allValues = [...data.map((item) => item.value)]
  if (compareData) {
    allValues.push(...compareData.map((item) => item.value))
  }
  const maxValue = Math.max(...allValues, 1) // Evitar divisão por zero

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="flex h-[180px] items-end gap-2">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100
          const compareHeight = compareData && compareData[index] ? (compareData[index].value / maxValue) * 100 : 0
          
          // Calcular a variação percentual com tratamento para valores zero
          let change = 0
          let showChange = false
          
          if (compareData && compareData[index]) {
            const currentValue = item.value
            const previousValue = compareData[index].value
            
            if (previousValue === 0 && currentValue > 0) {
              change = 100 // Se era zero e agora tem valor, mostra 100% de aumento
              showChange = true
            } else if (previousValue > 0) {
              change = ((currentValue - previousValue) / previousValue) * 100
              showChange = true
            }
          }

          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center">
                {compareData && showChange && (
                  <div
                    className={`text-xs font-medium ${change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-gray-500"}`}
                  >
                    {change !== 0 && (
                      <>
                        {change > 0 ? "+" : ""}
                        {change.toFixed(0)}%
                      </>
                    )}
                  </div>
                )}
                {showValues && (
                  <div className="text-xs font-medium">{formatValue(item.value)}</div>
                )}
              </div>
              <div className="relative w-full">
                {compareData && (
                  <div
                    className="absolute bottom-0 w-full rounded-sm bg-gray-300 opacity-40"
                    style={{ height: `${compareHeight}%`, minHeight: compareHeight > 0 ? "4px" : "0" }}
                  />
                )}
                <div
                  className="w-full rounded-sm bg-primary"
                  style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{item.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Componente para cartão de métrica
const MetricCard = ({
  title,
  value,
  previousValue,
  icon,
}: {
  title: string
  value: string | number
  previousValue?: string | number
  icon: React.ReactNode
}) => {
  // Calcular a variação percentual
  let percentChange = 0
  let isPositive = true
  let showChange = false

  if (previousValue !== undefined && previousValue !== null) {
    // Converter para números
    const numValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0 : value
    const numPrevValue =
      typeof previousValue === "string"
        ? Number.parseFloat(previousValue.replace(/[^0-9.-]+/g, "")) || 0
        : previousValue

    // Verificar se os valores são válidos e evitar divisão por zero
    if (!isNaN(numValue) && !isNaN(numPrevValue) && numPrevValue !== 0) {
      percentChange = ((numValue - numPrevValue) / Math.abs(numPrevValue)) * 100
      isPositive = percentChange >= 0
      showChange = true
    } else if (numPrevValue === 0 && numValue > 0) {
      // Caso especial: valor anterior era zero e agora é positivo
      showChange = true
      isPositive = true
      percentChange = 100 // Indicar como 100% de aumento
    } else if (numValue === 0 && numPrevValue > 0) {
      // Caso especial: valor atual é zero e anterior era positivo
      showChange = true
      isPositive = false
      percentChange = 100 // Indicar como 100% de diminuição
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {previousValue !== undefined && showChange && (
          <div className="flex items-center mt-1">
            <div className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"} flex items-center`}>
              {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {Math.abs(percentChange) > 1000 ? "999+" : Math.abs(percentChange).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground ml-1">vs. período anterior</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para cartão de atividade recente
const RecentActivityCard = ({ activities }: { activities: { title: string; date: string; status: string }[] }) => {
  const [showAll, setShowAll] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<"all" | "today" | "week" | "month">("all");
  const MAX_ACTIVITIES = 3;

  // Filtrar atividades com base nos filtros selecionados
  const filteredActivities = activities.filter(activity => {

    // Filtrar por período
    const activityDate = new Date(activity.date);
    const now = new Date();
    
    if (periodFilter === "today") {
      return activityDate.toDateString() === now.toDateString();
    } else if (periodFilter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return activityDate >= weekAgo;
    } else if (periodFilter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return activityDate >= monthAgo;
    }

    return true;
  });

  const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, MAX_ACTIVITIES);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">

            <div className="w-full sm:w-[180px]">
              <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as "all" | "today" | "week" | "month")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {displayedActivities.length > 0 ? (
            <>
              {displayedActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-md border p-3"
                >
                  <div
                    className={`mt-0.5 rounded-full p-1.5 ${
                      activity.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {activity.status === "completed" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
              {filteredActivities.length > MAX_ACTIVITIES && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Mostrar Menos" : `Mostrar Mais (${filteredActivities.length - MAX_ACTIVITIES})`}
                </Button>
              )}
            </>
          ) : (
            <div className="rounded-md border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {activities.length === 0
                  ? "Nenhuma atividade recente."
                  : "Nenhuma atividade encontrada com os filtros selecionados."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Tipos para os dados do dashboard
interface DashboardPeriodData {
  totalClients: number
  totalProtocols: number
  totalApplications: number
  totalValue: number
  pendingProtocols: number
  completedProtocols: number
  clientsWithProtocols: number
  monthlyApplications: { name: string; value: number }[]
  monthlyRevenue: { name: string; value: number }[]
  topModels: { name: string; value: number }[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [periodType, setPeriodType] = useState<"month" | "quarter" | "year">("month")
  const [currentPeriodData, setCurrentPeriodData] = useState<DashboardPeriodData>({
    totalClients: 0,
    totalProtocols: 0,
    totalApplications: 0,
    totalValue: 0,
    pendingProtocols: 0,
    completedProtocols: 0,
    clientsWithProtocols: 0,
    monthlyApplications: [],
    monthlyRevenue: [],
    topModels: [],
  })
  const [previousPeriodData, setPreviousPeriodData] = useState<DashboardPeriodData | null>(null)
  const [recentActivities, setRecentActivities] = useState<{ title: string; date: string; status: string }[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        // Buscar dados necessários
        const [protocols, clients] = await Promise.all([protocolsService.listProtocols(), clientsService.listClients()])

        // Separar protocolos regulares e modelos
        const regularProtocols = protocols.filter((protocol) => !protocol.isTemplate)
        const templateProtocols = protocols.filter((protocol) => protocol.isTemplate)
        
        // Mapear clientes para busca rápida
        const clientsMap = new Map()
        clients.forEach((client) => {
          clientsMap.set(client.id, client)
        })

        // Buscar aplicações para cada estágio de cada protocolo regular
        const allApplications: any[] = []
        const stageApplicationsMap = new Map()

        for (const protocol of regularProtocols) {
          for (const stage of protocol.stages) {
            if (stage.id) {
              try {
                const stageApps = await applicationsService.listStageApplications(stage.id)
                stageApplicationsMap.set(stage.id, stageApps)
                stageApps.forEach((app) => {
                  allApplications.push({
                    ...app,
                    protocolId: protocol.id,
                    protocolTitle: protocol.title,
                    clientId: protocol.clientId,
                    clientName: clientsMap.get(protocol.clientId)?.name || "Cliente não identificado",
                    stageValue: stage.value,
                    appliedAt: new Date(app.appliedAt),
                  })
                })
              } catch (error) {
                console.error(`Erro ao carregar aplicações do estágio ${stage.id}:`, error)
              }
            }
          }
        }

        // Verificar se um protocolo está completo
        const isProtocolComplete = (protocol: any) => {
          return protocol.stages.every((stage: any) => {
            if (!stage.id) return false
            const apps = stageApplicationsMap.get(stage.id)
            return apps && apps.length > 0
          })
        }

        // Calcular métricas
        const pendingProtocols = regularProtocols.filter((p) => !isProtocolComplete(p)).length
        const completedProtocols = regularProtocols.filter((p) => isProtocolComplete(p)).length

        // Calcular clientes com protocolos
        const clientsWithProtocolsSet = new Set(regularProtocols.map((p) => p.clientId))
        const clientsWithProtocols = clientsWithProtocolsSet.size

        // Calcular valor total
        const totalValue = regularProtocols.reduce((sum, protocol) => {
          return sum + protocol.stages.reduce((stageSum, stage) => {
            const stageValue = typeof stage.value === 'string' ? parseFloat(stage.value) : (stage.value || 0)
            return stageSum + stageValue
          }, 0)
        }, 0)

        // Analisar modelos mais utilizados
        // Assumimos que protocolos com o mesmo título que um modelo foram baseados nesse modelo
        const modelUsageCount: Record<string, { count: number; id: string | number; title: string; value: number }> = {}

        // Para cada modelo, contar quantos protocolos regulares têm o mesmo título
        templateProtocols.forEach((template) => {
          if (!template.id || !template.title) return // Skip if id or title is undefined
          
          const count = regularProtocols.filter((p) => p.title === template.title).length
          modelUsageCount[template.title] = {
            count,
            id: template.id,
            title: template.title,
            value: template.stages.reduce((sum, stage) => {
              const stageValue = typeof stage.value === 'string' ? parseFloat(stage.value) : (stage.value || 0)
              return sum + stageValue
            }, 0),
          }
        })

        // Ordenar modelos por uso (mais utilizados primeiro)
        const topModels = Object.values(modelUsageCount)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map((model) => ({
            name: model.title,
            value: model.count,
          }))

        // Definir datas para períodos atual e anterior
        const now = new Date()
        let currentPeriodStart: Date
        const currentPeriodEnd: Date = new Date(now)
        let previousPeriodStart: Date
        let previousPeriodEnd: Date

        // Configurar datas com base no tipo de período
        if (periodType === "month") {
          // Período atual: mês atual
          currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)

          // Período anterior: mês anterior
          previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0)
          previousPeriodStart = new Date(previousPeriodEnd.getFullYear(), previousPeriodEnd.getMonth(), 1)
        } else if (periodType === "quarter") {
          // Período atual: trimestre atual
          const currentQuarter = Math.floor(now.getMonth() / 3)
          currentPeriodStart = new Date(now.getFullYear(), currentQuarter * 3, 1)

          // Período anterior: trimestre anterior
          previousPeriodEnd = new Date(currentPeriodStart)
          previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1)
          previousPeriodStart = new Date(
            previousPeriodEnd.getMonth() >= 3 ? previousPeriodEnd.getFullYear() : previousPeriodEnd.getFullYear() - 1,
            (previousPeriodEnd.getMonth() + 9) % 12,
            1,
          )
        } else {
          // year
          // Período atual: ano atual
          currentPeriodStart = new Date(now.getFullYear(), 0, 1)

          // Período anterior: ano anterior
          previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1)
          previousPeriodEnd = new Date(now.getFullYear() - 1, 11, 31)
        }

        // Filtrar aplicações por período
        const currentPeriodApplications = allApplications.filter(
          (app) => app.appliedAt >= currentPeriodStart && app.appliedAt <= currentPeriodEnd,
        )

        const previousPeriodApplications = allApplications.filter(
          (app) => app.appliedAt >= previousPeriodStart && app.appliedAt <= previousPeriodEnd,
        )

        // Gerar dados mensais para gráficos
        const generateMonthlyData = (applications: any[], periodType: string, startDate: Date) => {
          if (periodType === "month") {
            // Para período mensal, mostrar dados por dia
            const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
            const dailyData = Array(daysInMonth)
              .fill(0)
              .map((_, i) => ({
                name: `${i + 1}`,
                value: 0,
              }))

            applications.forEach((app) => {
              // Verificar se a data da aplicação está no mesmo mês e ano
              if (
                app.appliedAt.getFullYear() === startDate.getFullYear() &&
                app.appliedAt.getMonth() === startDate.getMonth()
              ) {
                const day = app.appliedAt.getDate() - 1 // Índice 0-based
                if (day >= 0 && day < daysInMonth) {
                  dailyData[day].value++
                }
              }
            })

            // Retornar apenas alguns dias para não sobrecarregar o gráfico
            return dailyData.filter((_, i) => i % 5 === 0 || i === daysInMonth - 1)
          } else if (periodType === "quarter") {
            // Para trimestre, mostrar dados por mês (3 meses)
            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
            const startMonth = startDate.getMonth()
            const startYear = startDate.getFullYear()

            const monthlyData = Array(3)
              .fill(0)
              .map((_, i) => ({
                name: monthNames[(startMonth + i) % 12],
                value: 0,
              }))

            applications.forEach((app) => {
              // Verificar se a aplicação está no trimestre correto
              const appMonth = app.appliedAt.getMonth()
              const appYear = app.appliedAt.getFullYear()

              // Calcular o mês relativo ao início do trimestre
              let monthIndex = -1
              if (appYear === startYear) {
                monthIndex = appMonth - startMonth
              } else if (appYear === startYear + 1 && startMonth > 9) {
                // Caso especial para trimestres que cruzam o ano
                monthIndex = appMonth + (12 - startMonth)
              }

              if (monthIndex >= 0 && monthIndex < 3) {
                monthlyData[monthIndex].value++
              }
            })

            return monthlyData
          } else {
            // year
            // Para ano, mostrar dados por mês (12 meses)
            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
            const startYear = startDate.getFullYear()

            const monthlyData = Array(12)
              .fill(0)
              .map((_, i) => ({
                name: monthNames[i],
                value: 0,
              }))

            applications.forEach((app) => {
              // Verificar se a aplicação está no ano correto
              if (app.appliedAt.getFullYear() === startYear) {
                const month = app.appliedAt.getMonth()
                if (month >= 0 && month < 12) {
                  monthlyData[month].value++
                }
              }
            })

            return monthlyData
          }
        }
        const previousMonthlyApplications = generateMonthlyData(
          previousPeriodApplications,
          periodType,
          previousPeriodStart,
        )

        // Gerar dados de receita mensal
        const generateMonthlyRevenueData = (protocols: any[], periodType: string, startDate: Date) => {
          if (periodType === "month") {
            // Para período mensal, mostrar dados por dia
            const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
            const dailyData = Array(daysInMonth)
              .fill(0)
              .map((_, i) => ({
                name: `${i + 1}`,
                value: 0,
              }))

            protocols.forEach((protocol) => {
              if (!protocol.createdAt) return
              const protocolDate = new Date(protocol.createdAt)
              if (
                protocolDate.getFullYear() === startDate.getFullYear() &&
                protocolDate.getMonth() === startDate.getMonth()
              ) {
                const day = protocolDate.getDate() - 1 // Índice 0-based
                if (day >= 0 && day < daysInMonth) {
                  dailyData[day].value += protocol.stages.reduce((sum: number, stage: any) => {
                    const stageValue = typeof stage.value === 'string' ? parseFloat(stage.value) : (stage.value || 0)
                    return sum + stageValue
                  }, 0)
                }
              }
            })

            // Retornar apenas alguns dias para não sobrecarregar o gráfico
            return dailyData.filter((_, i) => i % 5 === 0 || i === daysInMonth - 1)
          } else if (periodType === "quarter") {
            // Para trimestre, mostrar dados por mês (3 meses)
            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
            const startMonth = startDate.getMonth()
            const startYear = startDate.getFullYear()

            const monthlyData = Array(3)
              .fill(0)
              .map((_, i) => ({
                name: monthNames[(startMonth + i) % 12],
                value: 0,
              }))

            protocols.forEach((protocol) => {
              if (!protocol.createdAt) return
              const protocolDate = new Date(protocol.createdAt)
              const appMonth = protocolDate.getMonth()
              const appYear = protocolDate.getFullYear()

              // Calcular o mês relativo ao início do trimestre
              let monthIndex = -1
              if (appYear === startYear) {
                monthIndex = appMonth - startMonth
              } else if (appYear === startYear + 1 && startMonth > 9) {
                // Caso especial para trimestres que cruzam o ano
                monthIndex = appMonth + (12 - startMonth)
              }

              if (monthIndex >= 0 && monthIndex < 3) {
                monthlyData[monthIndex].value += protocol.stages.reduce((sum: number, stage: any) => {
                  const stageValue = typeof stage.value === 'string' ? parseFloat(stage.value) : (stage.value || 0)
                  return sum + stageValue
                }, 0)
              }
            })

            return monthlyData
          } else {
            // year
            // Para ano, mostrar dados por mês (12 meses)
            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
            const startYear = startDate.getFullYear()

            const monthlyData = Array(12)
              .fill(0)
              .map((_, i) => ({
                name: monthNames[i],
                value: 0,
              }))

            protocols.forEach((protocol) => {
              if (!protocol.createdAt) return
              const protocolDate = new Date(protocol.createdAt)
              if (protocolDate.getFullYear() === startYear) {
                const month = protocolDate.getMonth()
                if (month >= 0 && month < 12) {
                  monthlyData[month].value += protocol.stages.reduce((sum: number, stage: any) => {
                    const stageValue = typeof stage.value === 'string' ? parseFloat(stage.value) : (stage.value || 0)
                    return sum + stageValue
                  }, 0)
                }
              }
            })

            return monthlyData
          }
        }
        const previousMonthlyRevenue = generateMonthlyRevenueData(
          regularProtocols,
          periodType,
          previousPeriodStart,
        )

        // Calcular métricas para o período atual
        const currentPeriodValue = regularProtocols
          .filter(protocol => {
            if (!protocol.createdAt) return false
            const protocolDate = new Date(protocol.createdAt)
            return protocolDate >= currentPeriodStart && protocolDate <= currentPeriodEnd
          })
          .reduce((sum, protocol) => {
            return sum + protocol.stages.reduce((stageSum, stage) => {
              const stageValue = typeof stage.value === 'string' ? parseFloat(stage.value) : (stage.value || 0)
              return stageSum + stageValue
            }, 0)
          }, 0)

        // Calcular métricas para o período anterior
        const previousPeriodValue = regularProtocols
          .filter(protocol => {
            if (!protocol.createdAt) return false
            const protocolDate = new Date(protocol.createdAt)
            return protocolDate >= previousPeriodStart && protocolDate <= previousPeriodEnd
          })
          .reduce((sum, protocol) => {
            return sum + protocol.stages.reduce((stageSum, stage) => {
              const stageValue = typeof stage.value === 'string' ? parseFloat(stage.value) : (stage.value || 0)
              return stageSum + stageValue
            }, 0)
          }, 0)

        // Preparar atividades recentes
        const recentActivitiesData = allApplications
          .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime())
          .slice(0, 5)
          .map((app) => ({
            title: `${app.clientName} - ${app.protocolTitle} (${app.Stage?.name})`,
            date: app.appliedAt.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "completed",
          }))

        // Atualizar estado com todos os dados calculados
        setCurrentPeriodData({
          totalClients: clients.length,
          totalProtocols: regularProtocols.length,
          totalApplications: currentPeriodApplications.length,
          totalValue: currentPeriodValue,
          pendingProtocols,
          completedProtocols,
          clientsWithProtocols,
          monthlyApplications: generateMonthlyData(currentPeriodApplications, periodType, currentPeriodStart),
          monthlyRevenue: generateMonthlyRevenueData(regularProtocols, periodType, currentPeriodStart),
          topModels,
        })

        setPreviousPeriodData({
          totalClients: clients.length, // Não temos dados históricos de clientes
          totalProtocols: regularProtocols.length, // Não temos dados históricos de protocolos
          totalApplications: previousPeriodApplications.length,
          totalValue: previousPeriodValue,
          pendingProtocols: 0, // Não temos dados históricos de protocolos pendentes
          completedProtocols: 0, // Não temos dados históricos de protocolos completos
          clientsWithProtocols: 0, // Não temos dados históricos de clientes com protocolos
          monthlyApplications: previousMonthlyApplications,
          monthlyRevenue: previousMonthlyRevenue,
          topModels: [], // Não temos dados históricos de modelos mais utilizados
        })

        setRecentActivities(recentActivitiesData)
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast, periodType])

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Determinar qual conteúdo mostrar com base no papel do usuário
  const getDashboardContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do dashboard...</p>
          </div>
        </div>
      )
    }

    // Conteúdo comum para todos os usuários
    const commonContent = (
      <>
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Período:</span>
            <Select value={periodType} onValueChange={(value) => setPeriodType(value as "month" | "quarter" | "year")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Clientes"
            value={currentPeriodData.totalClients}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Protocolos Ativos"
            value={currentPeriodData.pendingProtocols}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Aplicações Realizadas"
            value={currentPeriodData.totalApplications}
            previousValue={previousPeriodData?.totalApplications}
            icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          />
          <MetricCard
            title="Valor Total Aplicado"
            value={formatCurrency(currentPeriodData.totalValue)}
            previousValue={formatCurrency(previousPeriodData?.totalValue || 0)}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>
                Aplicações por {periodType === "month" ? "Dia" : periodType === "quarter" ? "Mês" : "Mês"}
              </CardTitle>
              <CardDescription>
                {periodType === "month"
                  ? "Mês atual vs. anterior"
                  : periodType === "quarter"
                    ? "Trimestre atual vs. anterior"
                    : "Ano atual vs. anterior"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={currentPeriodData.monthlyApplications}
                compareData={previousPeriodData?.monthlyApplications || null}
                title="Número de aplicações"
                showValues={true}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>
                Receita por {periodType === "month" ? "Dia" : periodType === "quarter" ? "Mês" : "Mês"}
              </CardTitle>
              <CardDescription>
                {periodType === "month"
                  ? "Mês atual vs. anterior"
                  : periodType === "quarter"
                    ? "Trimestre atual vs. anterior"
                    : "Ano atual vs. anterior"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={currentPeriodData.monthlyRevenue}
                compareData={previousPeriodData?.monthlyRevenue || null}
                title="Valor (R$)"
                showValues={true}
                formatValue={(value) => formatCurrency(value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Status dos Protocolos</CardTitle>
              <CardDescription>Visão geral de progresso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span>Protocolos Completos</span>
                  </div>
                  <span className="font-medium">
                    {currentPeriodData.completedProtocols} de {currentPeriodData.totalProtocols}
                  </span>
                </div>
                <Progress
                  value={
                    currentPeriodData.totalProtocols > 0
                      ? (currentPeriodData.completedProtocols / currentPeriodData.totalProtocols) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span>Clientes com Protocolos</span>
                  </div>
                  <span className="font-medium">
                    {currentPeriodData.clientsWithProtocols} de {currentPeriodData.totalClients}
                  </span>
                </div>
                <Progress
                  value={
                    currentPeriodData.totalClients > 0
                      ? (currentPeriodData.clientsWithProtocols / currentPeriodData.totalClients) * 100
                      : 0
                  }
                  className="h-2 bg-blue-100 [&>div]:bg-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>Aplicações Realizadas</span>
                  </div>
                  <span className="font-medium">{currentPeriodData.totalApplications}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-green-500" style={{ width: "100%" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Modelos Mais Utilizados</CardTitle>
              <CardDescription>Top 5 modelos de protocolo</CardDescription>
            </CardHeader>
            <CardContent>
              {currentPeriodData.topModels.length > 0 ? (
                <BarChart data={currentPeriodData.topModels} title="Número de protocolos criados" />
              ) : (
                <div className="flex flex-col items-center justify-center h-[150px] text-center">
                  <BookTemplate className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum modelo de protocolo foi utilizado ainda.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <RecentActivityCard activities={recentActivities} />
        </div>
      </>
    )

    // Conteúdo específico para o gestor
    if (user?.role === "admin") {
      return (
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="operations">Operações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {commonContent}
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Período:</span>
                <Select
                  value={periodType}
                  onValueChange={(value) => setPeriodType(value as "month" | "quarter" | "year")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensal</SelectItem>
                    <SelectItem value="quarter">Trimestral</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Valor Total Vendido"
                value={formatCurrency(currentPeriodData.totalValue)}
                previousValue={formatCurrency(previousPeriodData?.totalValue || 0)}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Valor Médio por Protocolo"
                value={formatCurrency(
                  currentPeriodData.totalProtocols > 0
                    ? currentPeriodData.totalValue / currentPeriodData.totalProtocols
                    : 0,
                )}
                icon={<LineChartIcon className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Valor Médio por Cliente"
                value={formatCurrency(
                  currentPeriodData.clientsWithProtocols > 0
                    ? currentPeriodData.totalValue / currentPeriodData.clientsWithProtocols
                    : 0,
                )}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Protocolos Vendidos"
                value={currentPeriodData.totalProtocols}
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>
                    Receita por {periodType === "month" ? "Dia" : periodType === "quarter" ? "Mês" : "Mês"}
                  </CardTitle>
                  <CardDescription>
                    {periodType === "month"
                      ? "Mês atual vs. anterior"
                      : periodType === "quarter"
                        ? "Trimestre atual vs. anterior"
                        : "Ano atual vs. anterior"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={currentPeriodData.monthlyRevenue}
                    compareData={previousPeriodData?.monthlyRevenue || null}
                    title="Valor (R$)"
                    showValues={true}
                    formatValue={(value) => formatCurrency(value)}
                  />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Previsão de Receita</CardTitle>
                  <CardDescription>Baseado no histórico de vendas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[180px] text-center">
                    <TrendingUp className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Previsão para o próximo {periodType === "month" ? "mês" : periodType === "quarter" ? "trimestre" : "ano"}:{" "}
                      <span className="font-medium text-primary">
                        {formatCurrency(currentPeriodData.totalValue * 1.1)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimativa baseada em crescimento de 10% em relação ao período atual
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Análise Financeira Detalhada</CardTitle>
                <CardDescription>Métricas financeiras para tomada de decisão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Taxa de Crescimento</h4>
                    <div className="text-2xl font-bold">
                      {previousPeriodData?.totalValue && previousPeriodData.totalValue > 0
                        ? `${(((currentPeriodData.totalValue - previousPeriodData.totalValue) / previousPeriodData.totalValue) * 100).toFixed(1)}%`
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Crescimento da receita em relação ao período anterior
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Ticket Médio</h4>
                    <div className="text-2xl font-bold">
                      {currentPeriodData.totalProtocols > 0
                        ? formatCurrency(currentPeriodData.totalValue / currentPeriodData.totalProtocols)
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Valor médio por protocolo vendido
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Retorno por Cliente</h4>
                    <div className="text-2xl font-bold">
                      {currentPeriodData.clientsWithProtocols > 0
                        ? formatCurrency(currentPeriodData.totalValue / currentPeriodData.clientsWithProtocols)
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Valor médio gerado por cliente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Período:</span>
                <Select
                  value={periodType}
                  onValueChange={(value) => setPeriodType(value as "month" | "quarter" | "year")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensal</SelectItem>
                    <SelectItem value="quarter">Trimestral</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Protocolos Ativos"
                value={currentPeriodData.pendingProtocols}
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Protocolos Concluídos"
                value={currentPeriodData.completedProtocols}
                icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Taxa de Conclusão"
                value={`${
                  currentPeriodData.totalProtocols > 0
                    ? Math.round((currentPeriodData.completedProtocols / currentPeriodData.totalProtocols) * 100)
                    : 0
                }%`}
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Aplicações por Protocolo"
                value={(currentPeriodData.totalProtocols > 0
                  ? currentPeriodData.totalApplications / currentPeriodData.totalProtocols
                  : 0
                ).toFixed(1)}
                icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>
                    Aplicações por {periodType === "month" ? "Dia" : periodType === "quarter" ? "Mês" : "Mês"}
                  </CardTitle>
                  <CardDescription>
                    {periodType === "month"
                      ? "Mês atual vs. anterior"
                      : periodType === "quarter"
                        ? "Trimestre atual vs. anterior"
                        : "Ano atual vs. anterior"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={currentPeriodData.monthlyApplications}
                    compareData={previousPeriodData?.monthlyApplications || null}
                    title="Número de aplicações"
                    showValues={true}
                  />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Modelos Mais Utilizados</CardTitle>
                  <CardDescription>Top 5 modelos de protocolo</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentPeriodData.topModels.length > 0 ? (
                    <BarChart data={currentPeriodData.topModels} title="Número de protocolos criados" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[150px] text-center">
                      <BookTemplate className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum modelo de protocolo foi utilizado ainda.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Análise Operacional</CardTitle>
                <CardDescription>Métricas para otimização de processos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Taxa de Conclusão</h4>
                    <div className="text-2xl font-bold">
                      {currentPeriodData.totalProtocols > 0
                        ? `${Math.round((currentPeriodData.completedProtocols / currentPeriodData.totalProtocols) * 100)}%`
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Porcentagem de protocolos concluídos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Taxa de Engajamento</h4>
                    <div className="text-2xl font-bold">
                      {currentPeriodData.totalClients > 0
                        ? `${Math.round((currentPeriodData.clientsWithProtocols / currentPeriodData.totalClients) * 100)}%`
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Porcentagem de clientes com protocolos ativos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Eficiência de Aplicação</h4>
                    <div className="text-2xl font-bold">
                      {currentPeriodData.totalProtocols > 0
                        ? (currentPeriodData.totalApplications / currentPeriodData.totalProtocols).toFixed(1)
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Média de aplicações por protocolo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <RecentActivityCard activities={recentActivities} />
          </TabsContent>
        </Tabs>
      )
    }

    // Para outros usuários, mostrar apenas o conteúdo comum
    return <div className="space-y-6">{commonContent}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bem-vindo, {user?.name}</h1>
        <p className="text-muted-foreground">Aqui está um resumo das atividades e métricas do sistema.</p>
      </div>

      {getDashboardContent()}

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Acesso Rápido</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {user?.role === "doctor" || user?.role === "admin" ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Atendimentos</CardTitle>
                <CardDescription>Visualize e gerencie atendimentos médicos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/appointments">
                    Acessar <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {user?.role === "closing" || user?.role === "admin" ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Protocolos</CardTitle>
                <CardDescription>Crie e gerencie protocolos de tratamento</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/protocols">
                    Acessar <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {
          user?.role === "technique" ||
          user?.role === "admin" ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Meus Protocolos</CardTitle>
                <CardDescription>Visualize e aplique protocolos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/my-protocols">
                    Acessar <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {user?.role === "stock" || user?.role === "admin" ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Estoque</CardTitle>
                <CardDescription>Visualize o consumo de produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/stock">
                    Acessar <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {user?.role === "admin" ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>Gerencie os usuários do sistema e suas permissões</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/users">
                    Acessar <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
