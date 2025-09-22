"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Input } from "@/src/components/ui/input"
import { Loader2, Search, Filter } from "lucide-react"
import { useToast } from "@/src/components/ui/use-toast"
import { applicationsService } from "@/services/applications-api"
import { protocolsService } from "@/services/protocols-api"
import { clientsService } from "@/services/clients-api"
import { usePagination } from "@/src/hooks/use-pagination"
import { PaginationControls } from "@/src/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"

interface Application {
  id: string | number
  stageId: string | number
  nurseId: string | number
  appliedAt: string
  status: string
  nurse?: {
    id: string | number
    name: string
    role: string
  }
  Stage?: {
    id: string | number
    name: string
    protocolId: string | number
    value?: number
  }
}

interface Protocol {
  id: string | number
  title: string
  clientId: string | number
  clientName?: string
}

interface Client {
  id: string | number
  name: string
}

export default function StockPage() {
  const [applications, setApplications] = useState<
    (Application & { protocolTitle?: string; clientName?: string; value?: number })[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    period: "all" as "all" | "today" | "week" | "month" | "custom",
    valueRange: "all" as "all" | "low" | "medium" | "high",
    startDate: "",
    endDate: "",
  })
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const { toast } = useToast()

  // Carregar todas as aplicações ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Buscar protocolos e clientes para referência
        const [protocolsData, clientsData] = await Promise.all([
          protocolsService.listProtocols(),
          clientsService.listClients(),
        ])

        // Criar mapas para busca rápida
        const protocolsMap = new Map<string | number, Protocol>()
        protocolsData.forEach((protocol) => {
          protocolsMap.set(protocol.id!, protocol)
        })

        const clientsMap = new Map<string | number, Client>()
        clientsData.forEach((client) => {
          clientsMap.set(client.id, client)
        })

        // Buscar todas as aplicações de todos os estágios
        const allApplications: (Application & { protocolTitle?: string; clientName?: string; value?: number })[] = []

        // Para cada protocolo
        for (const protocol of protocolsData) {
          // Para cada estágio do protocolo
          for (const stage of protocol.stages) {
            if (stage.id) {
              try {
                // Buscar aplicações deste estágio
                const stageApplications = await applicationsService.listStageApplications(stage.id)

                // Adicionar informações de protocolo e cliente a cada aplicação
                stageApplications.forEach((app) => {
                  const protocolData = protocolsMap.get(protocol.id!)
                  const clientData = protocolData ? clientsMap.get(protocolData.clientId) : undefined

                  allApplications.push({
                    ...app,
                    protocolTitle: protocolData?.title,
                    clientName: clientData?.name || protocol.clientName,
                    value: stage.value,
                  })
                })
              } catch (error) {
                console.error(`Erro ao carregar aplicações do estágio ${stage.id}:`, error)
              }
            }
          }
        }

        // Ordenar por data de aplicação (mais recente primeiro)
        allApplications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())

        setApplications(allApplications)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as aplicações.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Filtrar aplicações com base nos filtros selecionados
  const filteredApplications = applications.filter((app) => {
    // Filtrar por termo de pesquisa
    const matchesSearch =
      (app.clientName && app.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.protocolTitle && app.protocolTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.Stage?.name && app.Stage.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.nurse?.name && app.nurse.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtrar por valor
    if (filters.valueRange !== "all" && app.value) {
      if (filters.valueRange === "low" && app.value > 500) return false
      if (filters.valueRange === "medium" && (app.value <= 500 || app.value > 2000)) return false
      if (filters.valueRange === "high" && app.value <= 2000) return false
    }

    // Filtrar por período
    if (filters.period !== "all") {
      const appDate = new Date(app.appliedAt)
      const now = new Date()

      if (filters.period === "today") {
        return matchesSearch && appDate.toDateString() === now.toDateString()
      } else if (filters.period === "week") {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return matchesSearch && appDate >= weekAgo
      } else if (filters.period === "month") {
        const monthAgo = new Date(now)
        monthAgo.setMonth(now.getMonth() - 1)
        return matchesSearch && appDate >= monthAgo
      } else if (filters.period === "custom" && filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate)
        const end = new Date(filters.endDate)
        return matchesSearch && appDate >= start && appDate <= end
      }
    }

    return matchesSearch
  })

  // Configuração da paginação
  const {
    currentPage,
    totalPages,
    goToPage,
    paginatedItems: paginatedApplications,
    totalItems,
    itemsPerPage,
  } = usePagination({
    items: filteredApplications,
    itemsPerPage: 10,
  })

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
        <p className="text-muted-foreground">Visualize o consumo de produtos por protocolo.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por cliente, protocolo ou estágio..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filtros</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select 
                  value={filters.period} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, period: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo período</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                    <SelectItem value="custom">Período personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filters.period === "custom" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período personalizado</label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full"
                    />
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Faixa de valor</label>
                <Select 
                  value={filters.valueRange} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, valueRange: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a faixa de valor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os valores</SelectItem>
                    <SelectItem value="low">Até R$ 500</SelectItem>
                    <SelectItem value="medium">R$ 500 - R$ 2000</SelectItem>
                    <SelectItem value="high">Acima de R$ 2000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aplicações Realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando aplicações...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Estágio</TableHead>
                    <TableHead>Aplicado por</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplications.length > 0 ? (
                    paginatedApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.clientName || "Cliente não identificado"}</TableCell>
                        <TableCell>{app.protocolTitle || "Protocolo não identificado"}</TableCell>
                        <TableCell>{app.Stage?.name || "Estágio não identificado"}</TableCell>
                        <TableCell>{app.nurse?.name || "Técnico não identificado"}</TableCell>
                        <TableCell>{formatDate(app.appliedAt)}</TableCell>
                        <TableCell className="text-right">{app.value ? formatCurrency(app.value) : "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {searchTerm
                          ? "Nenhuma aplicação encontrada com esse termo de busca."
                          : "Nenhuma aplicação registrada."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Adicionar controles de paginação */}
              {filteredApplications.length > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
