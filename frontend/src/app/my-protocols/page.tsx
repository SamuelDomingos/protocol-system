"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ArrowRight,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { protocolsService, type Protocol } from "@/services/protocols-api";
import { applicationsService } from "@/services/applications-api";
import { useToast } from "@/src/components/ui/use-toast";
import { Badge } from "@/src/components/ui/badge";
import { usePagination } from "@/src/global/pagination/hooks/use-pagination";
import { PaginationControls } from "@/src/components/ui/data-table";
import { useAuth } from "@/src/contexts/auth-context";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/src/components/ui/dropdown-menu";

// Adicionar interface para o grupo de protocolos
interface ProtocolGroup {
  client: {
    id: string | number;
    name: string;
    cpf?: string;
  };
  protocols: Protocol[];
}

// Tipo genérico para o hook de paginação
type PaginatedItems<T> = {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  paginatedItems: T[];
  totalItems: number;
  itemsPerPage: number;
};

// Interface para os filtros
interface ProtocolFilters {
  searchPending: string;
  searchCompleted: string;
  viewMode: "default" | "byClient";
  sortField: "name" | "value";
  sortOrder: "asc" | "desc";
}

export default function MyProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stageApplications, setStageApplications] = useState<
    Record<string | number, any[]>
  >({});
  const [viewMode, setViewMode] = useState("default");
  const [expandedClients, setExpandedClients] = useState<
    Record<string | number, boolean>
  >({});
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estado centralizado para filtros
  const [filters, setFilters] = useState<ProtocolFilters>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('my_protocols_filters');
      return saved ? JSON.parse(saved) : {
        searchPending: "",
        searchCompleted: "",
        viewMode: "default",
        sortField: "name",
        sortOrder: "asc"
      };
    }
    return {
      searchPending: "",
      searchCompleted: "",
      viewMode: "default",
      sortField: "name",
      sortOrder: "asc"
    };
  });

  // Persistir filtros no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('my_protocols_filters', JSON.stringify(filters));
    }
  }, [filters]);

  // Função para atualizar um filtro específico
  const updateFilter = (key: keyof ProtocolFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Carregar protocolos ao montar o componente
  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        setIsLoading(true);
        const data = await protocolsService.listProtocols();

        // Filtrar apenas protocolos que não são modelos (isTemplate: false)
        const filteredProtocols = data.filter(
          (protocol) => !protocol.isTemplate
        );

        setProtocols(filteredProtocols);

        // Buscar aplicações para cada estágio de cada protocolo
        const applicationsData: Record<string | number, any[]> = {};

        for (const protocol of filteredProtocols) {
          for (const stage of protocol.stages) {
            if (stage.id) {
              try {
                const stageApps =
                  await applicationsService.listStageApplications(stage.id);
                applicationsData[stage.id] = stageApps;
              } catch (error) {
                console.error(
                  `Erro ao carregar aplicações do estágio ${stage.id}:`,
                  error
                );
              }
            }
          }
        }

        setStageApplications(applicationsData);
      } catch (error) {
        console.error("Erro ao carregar protocolos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de protocolos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProtocols();
  }, [toast]);

  // Atualizar a função para verificar se um estágio foi aplicado
  const isStageApplied = (stageId?: number | string) => {
    if (!stageId) return false;
    return stageApplications[stageId]?.length > 0;
  };

  // Atualizar a função para verificar se um protocolo está completo
  const isProtocolComplete = (protocol: Protocol) => {
    return protocol.stages.every((stage) => isStageApplied(stage.id));
  };

  // Atualizar a função para obter o próximo estágio pendente
  const getNextPendingStage = (protocol: Protocol) => {
    return protocol.stages.find((stage) => !isStageApplied(stage.id));
  };

  const handleOpenProtocol = (id: string | number) => {
    router.push(`/my-protocols/${id}`);
  };

  // Função para formatar a data
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Função para calcular dias restantes
  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(dateString);
    nextDate.setHours(0, 0, 0, 0);

    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Função para obter o texto de status baseado nos dias restantes
  const getStatusText = (dateString: string) => {
    const daysRemaining = getDaysRemaining(dateString);

    if (daysRemaining < 0) {
      return "Atrasado";
    } else if (daysRemaining === 0) {
      return "Hoje";
    } else if (daysRemaining === 1) {
      return "Amanhã";
    } else {
      return `Em ${daysRemaining} dias`;
    }
  };

  // Função para agrupar protocolos por cliente
  const groupProtocolsByClient = (protocols: Protocol[]): ProtocolGroup[] => {
    const groupedProtocols: Record<string, ProtocolGroup> = {};

    protocols.forEach((protocol) => {
      if (!protocol.Client?.id) return;

      const clientId = String(protocol.Client.id);
      if (!groupedProtocols[clientId]) {
        groupedProtocols[clientId] = {
          client: {
            id: protocol.Client.id,
            name: protocol.Client.name,
            cpf: protocol.Client.cpf
          },
          protocols: [],
        };
      }

      groupedProtocols[clientId].protocols.push(protocol);
    });

    return Object.values(groupedProtocols);
  };

  // Separar protocolos pendentes e completos
  const pendingProtocols = protocols.filter(
    (protocol) => !isProtocolComplete(protocol)
  );
  const completedProtocols = protocols.filter((protocol) =>
    isProtocolComplete(protocol)
  );

  // Função para ordenar os protocolos
  const sortProtocols = (protocols: Protocol[]) => {
    return [...protocols].sort((a, b) => {
      if (filters.sortField === "name") {
        const nameA = a.Client?.name || "";
        const nameB = b.Client?.name || "";
        return filters.sortOrder === "asc" 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        const valueA = a.stages.reduce((total, stage) => total + Number(stage.value), 0);
        const valueB = b.stages.reduce((total, stage) => total + Number(stage.value), 0);
        return filters.sortOrder === "asc" 
          ? valueA - valueB
          : valueB - valueA;
      }
    });
  };

  // Filtrar e ordenar protocolos com base nos filtros
  const filteredPendingProtocols = sortProtocols(
    pendingProtocols.filter((protocol) => {
      return protocol.title.toLowerCase().includes(filters.searchPending.toLowerCase()) ||
        (protocol.Client?.name && protocol.Client.name.toLowerCase().includes(filters.searchPending.toLowerCase())) ||
        (protocol.Client?.cpf && protocol.Client.cpf.includes(filters.searchPending));
    })
  );

  const filteredCompletedProtocols = sortProtocols(
    completedProtocols.filter((protocol) => {
      return protocol.title.toLowerCase().includes(filters.searchCompleted.toLowerCase()) ||
        (protocol.Client?.name && protocol.Client.name.toLowerCase().includes(filters.searchCompleted.toLowerCase())) ||
        (protocol.Client?.cpf && protocol.Client.cpf.includes(filters.searchCompleted));
    })
  );

  // Agrupar os protocolos filtrados
  const groupedPendingProtocols = groupProtocolsByClient(filteredPendingProtocols);
  const groupedCompletedProtocols = groupProtocolsByClient(filteredCompletedProtocols);

  // Configuração da paginação para visualização padrão
  const defaultPagination: PaginatedItems<Protocol> = usePagination({
    items: filteredPendingProtocols,
    itemsPerPage: 10,
  });

  // Configuração da paginação para visualização agrupada
  const groupedPagination: PaginatedItems<ProtocolGroup> = usePagination({
    items: groupedPendingProtocols,
    itemsPerPage: 5,
  });

  // Configuração da paginação para protocolos completados
  const completedPagination: PaginatedItems<Protocol> = usePagination({
    items: filteredCompletedProtocols,
    itemsPerPage: 10,
  });

  // Verificar permissões
  const canViewProtocols = hasPermission("applications", "canRead");
  const canCreateProtocols = hasPermission("applications", "canCreate");
  const canUpdateProtocols = hasPermission("applications", "canUpdate");
  const canDeleteProtocols = hasPermission("applications", "canDelete");

  if (!canViewProtocols) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Você não tem permissão para visualizar protocolos.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Carregando protocolos...
          </p>
        </div>
      </div>
    );
  }

  const toggleClientExpansion = (clientId: string | number) => {
    setExpandedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meus Protocolos</h1>
        <p className="text-muted-foreground">
          Visualize e aplique os protocolos atribuídos a você.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pendentes ({pendingProtocols.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Finalizados ({completedProtocols.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, CPF ou protocolo..."
                className="pl-8 w-full"
                value={filters.searchPending}
                onChange={(e) => updateFilter("searchPending", e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuCheckboxItem
                  checked={filters.sortField === "name"}
                  onSelect={(e) => {
                    e.preventDefault();
                    updateFilter("sortField", "name");
                  }}
                >
                  Nome do cliente
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuCheckboxItem
                  checked={filters.sortField === "value"}
                  onSelect={(e) => {
                    e.preventDefault();
                    updateFilter("sortField", "value");
                  }}
                >
                  Valor do protocolo
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Direção</DropdownMenuLabel>
                
                <DropdownMenuCheckboxItem
                  checked={filters.sortOrder === "asc"}
                  onSelect={(e) => {
                    e.preventDefault();
                    updateFilter("sortOrder", "asc");
                  }}
                >
                  Crescente
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuCheckboxItem
                  checked={filters.sortOrder === "desc"}
                  onSelect={(e) => {
                    e.preventDefault();
                    updateFilter("sortOrder", "desc");
                  }}
                >
                  Decrescente
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Visualização</DropdownMenuLabel>
                
                <DropdownMenuCheckboxItem
                  checked={filters.viewMode === "default"}
                  onSelect={(e) => {
                    e.preventDefault();
                    updateFilter("viewMode", "default");
                  }}
                >
                  Visualização padrão
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuCheckboxItem
                  checked={filters.viewMode === "byClient"}
                  onSelect={(e) => {
                    e.preventDefault();
                    updateFilter("viewMode", "byClient");
                  }}
                >
                  Agrupar por cliente
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredPendingProtocols.length > 0 ? (
            filters.viewMode === "default" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {defaultPagination.paginatedItems.map((protocol: Protocol) => {
                  const nextStage = getNextPendingStage(protocol);
                  const nextDate = nextStage?.scheduledDate;

                  return (
                    <Card
                      key={protocol.id}
                      className="overflow-hidden transition-all hover:shadow-md"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {protocol.title}
                            </CardTitle>
                            <div className="flex flex-col gap-1 mt-1">
                              <p className="text-muted-foreground">
                                Cliente: {protocol.Client?.name}
                              </p>
                              {protocol.Client?.cpf && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <User className="h-3.5 w-3.5" />
                                  <span className="font-mono">
                                    CPF: {protocol.Client?.cpf}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {nextDate && (
                            <Badge variant="outline" className="font-normal">
                              {getStatusText(nextDate)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {nextStage && (
                            <div className="rounded-md bg-muted p-3">
                              <h4 className="text-sm font-semibold mb-2">
                                Próximo estágio:
                              </h4>
                              <p className="text-sm">{nextStage.name}</p>

                              {/* Calcula a data prevista */}
                              {protocol.createdAt != null &&
                                nextStage.intervalDays != null && (
                                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>
                                      {formatDate(
                                        new Date(
                                          new Date(protocol.createdAt).setDate(
                                            new Date(
                                              protocol.createdAt
                                            ).getDate() +
                                              Number(nextStage.intervalDays)
                                          )
                                        ).toISOString()
                                      )}
                                    </span>
                                  </div>
                                )}
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {
                                  protocol.stages.filter((s) =>
                                    isStageApplied(s.id)
                                  ).length
                                }{" "}
                                de {protocol.stages.length} estágios
                              </span>
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              className="ml-auto"
                              onClick={() => handleOpenProtocol(protocol.id!)}
                              disabled={!canViewProtocols}
                            >
                              Ver detalhes{" "}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {groupedPagination.paginatedItems.map((group: ProtocolGroup) => (
                  <Card key={group.client.id} className="overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleClientExpansion(group.client.id)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <h3 className="text-lg font-medium">
                          {group.client.name}
                        </h3>
                        {group.client.cpf && (
                          <span className="text-sm text-muted-foreground font-mono ml-2">
                            CPF: {group.client.cpf}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {group.protocols.length} protocolos
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          {expandedClients[group.client.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {expandedClients[group.client.id] && (
                      <div className="p-4 pt-0 border-t">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {group.protocols.map((protocol) => {
                            const nextStage = getNextPendingStage(protocol);
                            const nextDate = nextStage?.scheduledDate;

                            return (
                              <Card
                                key={protocol.id}
                                className="overflow-hidden transition-all hover:shadow-md"
                              >
                                {/* Conteúdo do Card como antes */}
                                <CardHeader className="pb-2">
                                  <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">
                                      {protocol.title}
                                    </CardTitle>
                                    {nextDate && (
                                      <Badge
                                        variant="outline"
                                        className="font-normal"
                                      >
                                        {getStatusText(nextDate)}
                                      </Badge>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {nextStage && (
                                      <div className="rounded-md bg-muted p-3">
                                        <h4 className="text-sm font-semibold mb-2">
                                          Próximo estágio:
                                        </h4>
                                        <p className="text-sm">
                                          {nextStage.name}
                                        </p>

                                        {protocol.createdAt != null &&
                                          nextStage.intervalDays != null && (
                                            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                              <CalendarDays className="h-4 w-4" />
                                              <span>
                                                {formatDate(
                                                  new Date(
                                                    new Date(
                                                      protocol.createdAt
                                                    ).setDate(
                                                      new Date(
                                                        protocol.createdAt
                                                      ).getDate() +
                                                        Number(
                                                          nextStage.intervalDays
                                                        )
                                                    )
                                                  ).toISOString()
                                                )}
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                    )}

                                    <div className="flex justify-between items-center mt-4">
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                          {
                                            protocol.stages.filter((s) =>
                                              isStageApplied(s.id)
                                            ).length
                                          }{" "}
                                          de {protocol.stages.length} estágios
                                        </span>
                                      </div>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="ml-auto"
                                        onClick={() =>
                                          handleOpenProtocol(protocol.id!)
                                        }
                                        disabled={!canViewProtocols}
                                      >
                                        Ver detalhes{" "}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                {filters.searchPending
                  ? "Nenhum protocolo pendente encontrado com esse termo de busca."
                  : "Não há protocolos pendentes atribuídos a você no momento."}
              </p>
            </div>
          )}

          {/* Adicionar controles de paginação para ambas as visualizações */}
          {filteredPendingProtocols.length > 0 && (
            <PaginationControls
              currentPage={viewMode === "default" ? defaultPagination.currentPage : groupedPagination.currentPage}
              totalPages={viewMode === "default" ? defaultPagination.totalPages : groupedPagination.totalPages}
              onPageChange={viewMode === "default" ? defaultPagination.goToPage : groupedPagination.goToPage}
              totalItems={viewMode === "default" ? defaultPagination.totalItems : groupedPagination.totalItems}
              itemsPerPage={viewMode === "default" ? defaultPagination.itemsPerPage : groupedPagination.itemsPerPage}
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, CPF ou protocolo..."
              className="pl-8 w-full"
              value={filters.searchCompleted}
              onChange={(e) => updateFilter("searchCompleted", e.target.value)}
            />
          </div>

          {filteredCompletedProtocols.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedPagination.paginatedItems.map((protocol) => (
                <Card
                  key={protocol.id}
                  className="overflow-hidden transition-all hover:shadow-md bg-muted/30"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        {protocol.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Finalizado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>
                          Todos os {protocol.stages.length} estágios
                          concluídos
                        </span>
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenProtocol(protocol.id!)
                          }
                          disabled={!canViewProtocols}
                        >
                          Ver histórico{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                {filters.searchCompleted
                  ? "Nenhum protocolo finalizado encontrado com esse termo de busca."
                  : "Não há protocolos finalizados no momento."}
              </p>
            </div>
          )}

          {/* Adicionar controles de paginação para protocolos completados */}
          {filteredCompletedProtocols.length > 0 && (
            <PaginationControls
              currentPage={completedPagination.currentPage}
              totalPages={completedPagination.totalPages}
              onPageChange={completedPagination.goToPage}
              totalItems={completedPagination.totalItems}
              itemsPerPage={completedPagination.itemsPerPage}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
