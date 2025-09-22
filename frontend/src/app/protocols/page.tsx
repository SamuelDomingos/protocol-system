"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Plus, Trash, Edit, Loader2, Search, FileText, BookTemplate, Users, SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react"
import { useToast } from "@/src/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { useAuth } from "@/src/contexts/auth-context"
import { type Protocol, type ProtocolStage, protocolsService } from "@/services/protocols-api"
import { type Client, clientsService } from "@/services/clients-api"
import { Badge } from "@/src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { usePagination } from "@/src/hooks/use-pagination"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import React from "react"
import { usePermissions } from "@/src/hooks/use-permissions"
import { ProtocolFormDialog } from "@/src/components/protocol-form-dialog"

export default function ProtocolsPage() {
  const { user } = useAuth()
  const { getModulePermissions } = usePermissions()
  const { toast } = useToast()
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedClient, setSelectedClient] = useState("")
  const [protocolTitle, setProtocolTitle] = useState("")
  const [stages, setStages] = useState<Omit<ProtocolStage, "id" | "order">[]>([])
  const [currentProtocolId, setCurrentProtocolId] = useState<string | number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [protocolToDelete, setProtocolToDelete] = useState<string | number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('protocols_searchTerm');
      return saved || "";
    }
    return "";
  });
  const [searchModelTerm, setSearchModelTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('protocols_searchModelTerm');
      return saved || "";
    }
    return "";
  });
  const [templateProtocols, setTemplateProtocols] = useState<
    { id: string | number; title: string; clientName?: string }[]
  >([])
  const [isLoadingProtocolTemplate, setIsLoadingProtocolTemplate] = useState(false)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('protocols_activeTab');
      return saved || "protocols";
    }
    return "protocols";
  });
  const [isCreatingModel, setIsCreatingModel] = useState(false)
  const [isGroupedByClient, setIsGroupedByClient] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('protocols_isGroupedByClient');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('protocols_expandedGroups');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('protocols_sortOrder');
      return saved ? JSON.parse(saved) : "asc";
    }
    return "asc";
  });
  const [sortField, setSortField] = useState<"name" | "value">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('protocols_sortField');
      return saved ? JSON.parse(saved) : "name";
    }
    return "name";
  });
  const [showHighValueOnly, setShowHighValueOnly] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('protocols_showHighValueOnly');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [currentProtocol, setCurrentProtocol] = useState<Protocol | undefined>()

  // Obter permissões do módulo de protocolos
  const { canView, canCreate, canUpdate, canDelete } = getModulePermissions("protocols")
  
  // Verificar permissões
  const isAdmin = user?.role === "admin"

  // Carregar protocolos e clientes ao montar o componente
  useEffect(() => {
    if (canView) {
      fetchProtocols()
      fetchClients()
    }
  }, [canView])


  // Função para buscar protocolos
  const fetchProtocols = async () => {
    try {
      setIsLoading(true)
      const [protocolsData, clientsData] = await Promise.all([
        protocolsService.listProtocols(),
        clientsService.listClients()
      ])
      
      if (!Array.isArray(protocolsData)) {
        console.error("Dados de protocolos não são um array:", protocolsData)
        setProtocols([])
        setTemplateProtocols([])
        return
      }

      // Adicionar dados do cliente aos protocolos
      const protocolsWithClientData = protocolsData.map((protocol) => {
        const client = clientsData.find((c) => c.id === protocol.clientId)
        return {
          ...protocol,
          Client: client ? {
            id: client.id,
            name: client.name,
            cpf: client.cpf || ""
          } : undefined
        }
      })

      setProtocols(protocolsWithClientData)
      setClients(clientsData)

      // Extrair apenas protocolos marcados como templates para o combobox
      const templates = protocolsData
        .filter((protocol) => protocol.isTemplate)
        .map((protocol) => ({
          id: protocol.id!,
          title: protocol.title,
          clientName: undefined // Modelos não precisam de nome do cliente
        }))

      setTemplateProtocols(templates)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      
      // Agrupamento agora é feito via useMemo, não é necessário setar estado manualmente
    }
  }

  // Função para buscar clientes
  const fetchClients = async () => {
    try {
      const data = await clientsService.listClients()
      setClients(data)
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    }
  }

  // Função para limpar o formulário
  const resetForm = () => {
    setSelectedClient("")
    setProtocolTitle("")
    setStages([])
    setCurrentProtocolId(null)
    setIsCreating(false)
    setIsEditing(false)
    setIsCreatingModel(false)
  }

  // Função para carregar os dados de um protocolo para edição
  const handleEditProtocol = (protocol: Protocol) => {
    if (!canUpdate) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar protocolos.",
        variant: "destructive",
      })
      return
    }

    setCurrentProtocol(protocol)
    setCurrentProtocolId(protocol.id!)
    setIsCreatingModel(false)
    setIsEditing(true)
    setIsCreating(true)
    setActiveTab("protocols")

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Nova função para editar modelos
  const handleEditModel = (protocol: Protocol) => {
    if (!canUpdate) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar modelos.",
        variant: "destructive",
      })
      return
    }

    setCurrentProtocol(protocol)
    setCurrentProtocolId(protocol.id!)
    setIsCreatingModel(true)
    setIsEditing(true)
    setIsCreating(true)
    setActiveTab("models")

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Função para carregar um template de protocolo existente
  const handleLoadProtocolTemplate = async (title: string) => {
    const matchingTemplates = protocols.filter((p) => p.isTemplate && p.title === title);
    if (matchingTemplates.length === 0) return;
  
    try {
      setIsLoadingProtocolTemplate(true);
  
      const templateProtocol = matchingTemplates[0];
  
      // Aqui garantimos que cada stage vem completo do template,
      // incluindo intervalDays do próprio template:
      const formattedStages = templateProtocol.stages.map((stage) => ({
        name: stage.name,
        value: stage.value,
        intervalDays: stage.intervalDays,
      }));
  
      // **Zera completamente** o formulário antes de setar os novos estágios
      setStages([])

      // Depois, no próximo tick, seta o template completo
      setTimeout(() => {
        setStages(formattedStages)
      }, 0)
  
      toast({
        title: "Modelo carregado",
        description: "As etapas do protocolo modelo foram carregadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao carregar modelo de protocolo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o modelo do protocolo.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProtocolTemplate(false);
    }
  };
  

  // Função para confirmar a exclusão de um protocolo
  const handleDeleteClick = (id: string | number) => {
    if (!canDelete) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para excluir protocolos.",
        variant: "destructive",
      })
      return
    }

    setProtocolToDelete(id)
    setDeleteDialogOpen(true)
  }

  // Função para excluir um protocolo
  const handleDeleteProtocol = async () => {
    if (!protocolToDelete) return

    try {
      setIsSubmitting(true)
      await protocolsService.deleteProtocol(protocolToDelete)

      // Remove pelo mesmo tipo: converte ambos pra string
      const deletedProtocol = protocols.find((p) => String(p.id) === String(protocolToDelete))
      setProtocols((prev) => prev.filter((p) => String(p.id) !== String(protocolToDelete)))

      // Se o protocolo excluído era um template, atualizar a lista de templates
      if (deletedProtocol?.isTemplate) {
        setTemplateProtocols((prev) => prev.filter((p) => String(p.id) !== String(protocolToDelete)))
      }

      toast({
        title: "Protocolo excluído",
        description: "O protocolo foi excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir protocolo:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o protocolo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setDeleteDialogOpen(false)
      setProtocolToDelete(null)
    }
  }

  const handleAddStage = () => {
    // Se já existem estágios, copie os dados do último estágio
    const lastStage = stages.length > 0 ? stages[stages.length - 1] : null

    const newStage: Omit<ProtocolStage, "id" | "order"> = {
      name: lastStage ? lastStage.name : "",
      value: lastStage ? lastStage.value : 0,
      intervalDays: lastStage ? lastStage.intervalDays : 0,
    }

    setStages([...stages, newStage])
  }

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index))
  }

  const handleStageChange = (index: number, field: keyof Omit<ProtocolStage, "id" | "order">, value: any) => {
    const updatedStages = [...stages]
    updatedStages[index] = { ...updatedStages[index], [field]: value }
    setStages(updatedStages)
  }

  const handleSaveProtocol = async () => {
    if (!protocolTitle || stages.length === 0) {
      toast({
        title: "Erro ao salvar",
        description: "Preencha todos os campos obrigatórios e adicione pelo menos um estágio.",
        variant: "destructive",
      })
      return
    }

    // Se estamos criando um modelo, não precisamos de cliente
    if (!isCreatingModel && !selectedClient) {
      toast({
        title: "Erro ao salvar",
        description: "Selecione um cliente para o protocolo.",
        variant: "destructive",
      })
      return
    }

    // Check if all stages have required fields
    const invalidStages = stages.some((stage) => !stage.name || stage.value <= 0)

    if (invalidStages) {
      toast({
        title: "Erro ao salvar",
        description: "Preencha todos os campos de cada estágio corretamente.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const protocolData = {
        clientId: isCreatingModel ? null : String(selectedClient), // Send null for template protocols
        title: protocolTitle,
        stages: stages.map((stage) => ({
          name: stage.name,
          value: Number(stage.value),
          intervalDays: Number(stage.intervalDays),
        })),
        isTemplate: isCreatingModel,
      }         

      if (isEditing && currentProtocolId) {
        // Obter o protocolo atual para preservar o status isTemplate se não estamos editando explicitamente um modelo
        const currentProtocol = protocols.find((p) => p.id === currentProtocolId)

        // Atualizar protocolo existente, mantendo o status isTemplate a menos que estejamos explicitamente criando/editando um modelo
        const updatedProtocolData = {
          ...protocolData,
          isTemplate: isCreatingModel ? true : currentProtocol?.isTemplate || false,
        }

        const updatedProtocol = await protocolsService.updateProtocol(currentProtocolId, updatedProtocolData)

        // Adicionar nome do cliente
        const client = clients.find((c) => c.id === updatedProtocol.clientId)
        updatedProtocol.Client = client ? {
          id: client.id,
          name: client.name,
          cpf: client.cpf || ""
        } : undefined

        // Atualizar a lista localmente
        setProtocols(protocols.map((p) => (p.id === updatedProtocol.id ? updatedProtocol : p)))

        // Se for um modelo, atualizar a lista de templates
        if (updatedProtocol.isTemplate) {
          setTemplateProtocols((prev) => {
            const exists = prev.some((t) => String(t.id) === String(updatedProtocol.id))
            if (exists) {
              return prev.map((t) =>
                String(t.id) === String(updatedProtocol.id)
                  ? {
                      id: updatedProtocol.id!,
                      title: updatedProtocol.title,
                      clientName: updatedProtocol.Client?.name,
                    }
                  : t,
              )
            } else {
              return [
                ...prev,
                {
                  id: updatedProtocol.id!,
                  title: updatedProtocol.title,
                  clientName: updatedProtocol.Client?.name,
                },
              ]
            }
          })
        }

        toast({
          title: "Protocolo atualizado",
          description: "O protocolo foi atualizado com sucesso.",
        })
      } else {
        // Criar novo protocolo (como modelo ou não, dependendo de isCreatingModel)
        const newProtocol = await protocolsService.createProtocol(protocolData)

        // Buscar o cliente atualizado para garantir que temos os dados mais recentes
        const client = clients.find((c) => c.id === newProtocol.clientId)
        newProtocol.Client = client ? {
          id: client.id,
          name: client.name,
          cpf: client.cpf || ""
        } : undefined

        // Adicionar à lista
        setProtocols(prev => [...prev, newProtocol])

        // Se for um modelo, adicionar à lista de templates
        if (newProtocol.isTemplate) {
          setTemplateProtocols(prev => [
            ...prev,
            {
              id: newProtocol.id!,
              title: newProtocol.title,
              clientName: newProtocol.Client?.name,
            },
          ])
        }

        toast({
          title: isCreatingModel ? "Modelo criado" : "Protocolo criado",
          description: isCreatingModel
            ? "O modelo de protocolo foi criado com sucesso."
            : "O protocolo foi criado com sucesso.",
        })
      }

      // Reset form
      resetForm()
      setIsCreatingModel(false)
    } catch (error) {
      console.error("Erro ao salvar protocolo:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o protocolo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Filtrar protocolos regulares (não modelos)
  const regularProtocols = protocols.filter((protocol) => !protocol.isTemplate);

  // Filtrar protocolos com base no termo de pesquisa (nome, CPF ou título do protocolo)
  const filteredBySearchRegularProtocols = regularProtocols.filter(
    (protocol) =>
      protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (protocol.Client?.name && protocol.Client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (protocol.Client?.cpf && protocol.Client.cpf.includes(searchTerm))
  );

  // Aplicar filtro para mostrar apenas protocolos de alto valor
  const filteredRegularProtocols = showHighValueOnly 
    ? filteredBySearchRegularProtocols.filter(protocol => {
        const totalValue = protocol.stages.reduce((total, stage) => total + Number(stage.value), 0)
        return totalValue > 10000 // Exemplo: considerar alto valor acima de 10.000
      })
    : filteredBySearchRegularProtocols;

  // Ordenar protocolos
  const sortedRegularProtocols = [...filteredRegularProtocols].sort((a, b) => {
    if (sortField === "name") {
      const nameA = a.Client?.name || "";
      const nameB = b.Client?.name || "";
      return sortOrder === "asc" 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    } else {
      const valueA = a.stages.reduce((total, stage) => total + Number(stage.value), 0);
      const valueB = b.stages.reduce((total, stage) => total + Number(stage.value), 0);
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    }
  });

  // Função pura para agrupar protocolos por cliente
  const groupProtocolsByClient = (protocolsToGroup: Protocol[]) => {
    const grouped: Record<string, Protocol[]> = {};
    protocolsToGroup.forEach(protocol => {
      if (protocol.Client?.id) {
        const clientId = String(protocol.Client.id);
        if (!grouped[clientId]) {
          grouped[clientId] = [];
        }
        grouped[clientId].push(protocol);
      } else {
        if (!grouped['unknown']) {
          grouped['unknown'] = [];
        }
        grouped['unknown'].push(protocol);
      }
    });
    return grouped;
  };

  const filteredAndSortedProtocols = useMemo(() => {
    // Filtrar protocolos regulares (não modelos)
    const regularProtocols = protocols.filter((protocol) => !protocol.isTemplate);

    // Filtrar protocolos com base no termo de pesquisa
    const filteredBySearch = regularProtocols.filter(
      (protocol) =>
        protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (protocol.Client?.name && protocol.Client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (protocol.Client?.cpf && protocol.Client.cpf.includes(searchTerm))
    );

    // Aplicar filtro para mostrar apenas protocolos de alto valor
    const filtered = showHighValueOnly 
      ? filteredBySearch.filter(protocol => {
          const totalValue = protocol.stages.reduce((total, stage) => total + Number(stage.value), 0);
          return totalValue > 10000; // Considerar alto valor acima de 10.000
        })
      : filteredBySearch;

    // Ordenar protocolos
    return [...filtered].sort((a, b) => {
      if (sortField === "name") {
        const nameA = a.Client?.name || "";
        const nameB = b.Client?.name || "";
        return sortOrder === "asc" 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      } else {
        const valueA = a.stages.reduce((total, stage) => total + Number(stage.value), 0);
        const valueB = b.stages.reduce((total, stage) => total + Number(stage.value), 0);
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }
    });
  }, [protocols, searchTerm, showHighValueOnly, sortField, sortOrder]);

  // Agrupamento memoizado
  const groupedProtocols = useMemo(() => {
    if (isGroupedByClient) {
      return groupProtocolsByClient(filteredAndSortedProtocols);
    }
    return {};
  }, [isGroupedByClient, filteredAndSortedProtocols]);

  const toggleGrouping = () => {
    const newValue = !isGroupedByClient;
    setIsGroupedByClient(newValue);
    localStorage.setItem('protocols_isGroupedByClient', JSON.stringify(newValue));
  };

  const toggleGroup = (clientId: string) => {
    const newExpandedGroups = {
      ...expandedGroups,
      [clientId]: !expandedGroups[clientId]
    };
    setExpandedGroups(newExpandedGroups);
    localStorage.setItem('protocols_expandedGroups', JSON.stringify(newExpandedGroups));
  };

  // Filtrar protocolos modelo
  const modelProtocols = protocols.filter((protocol) => protocol.isTemplate)

  // Filtrar protocolos modelo com base no termo de pesquisa
  const filteredModelProtocols = modelProtocols.filter(
    (protocol) =>
      protocol.title.toLowerCase().includes(searchModelTerm.toLowerCase()) ||
      (protocol.Client?.name && protocol.Client.name.toLowerCase().includes(searchModelTerm.toLowerCase())) ||
      (protocol.Client?.cpf && protocol.Client.cpf.includes(searchModelTerm))
  )

  // Usar o hook de paginação para protocolos regulares
  const {
    currentPage: regularCurrentPage,
    totalPages: regularTotalPages,
    goToPage: regularGoToPage,
    paginatedItems: paginatedRegularProtocols,
    totalItems: regularTotalItems,
    itemsPerPage: regularItemsPerPage,
  } = usePagination({
    items: isGroupedByClient ? Object.values(groupedProtocols).flat() : sortedRegularProtocols,
    itemsPerPage: 10,
  })

  // Usar o hook de paginação para protocolos modelo
  const {
    currentPage: modelCurrentPage,
    totalPages: modelTotalPages,
    goToPage: modelGoToPage,
    paginatedItems: paginatedModelProtocols,
    totalItems: modelTotalItems,
    itemsPerPage: modelItemsPerPage,
  } = usePagination({
    items: filteredModelProtocols,
    itemsPerPage: 10,
  })

  // Função para expandir/recolher todos os grupos
  const toggleAllGroups = (expand: boolean) => {
    const newExpandedGroups: Record<string, boolean> = {}
    Object.keys(groupedProtocols).forEach(clientId => {
      newExpandedGroups[clientId] = expand
    })
    setExpandedGroups(newExpandedGroups)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('protocols_isGroupedByClient', JSON.stringify(isGroupedByClient));
    }
  }, [isGroupedByClient]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando protocolos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Protocolos por Cliente</h1>
          <p className="text-muted-foreground">Gerencie os protocolos de tratamento para cada cliente.</p>
        </div>
        {canCreate && (
          <Button onClick={() => {
            setIsCreating(true)
            setIsEditing(false)
            setIsCreatingModel(false)
            setCurrentProtocol(undefined)
          }}>
            Criar Protocolo
          </Button>
        )}
      </div>

      <ProtocolFormDialog
        isOpen={isCreating}
        onOpenChange={(open) => {
          setIsCreating(open)
          if (!open) {
            setIsEditing(false)
            setIsCreatingModel(false)
            setCurrentProtocol(undefined)
          }
        }}
        onSuccess={fetchProtocols}
        isEditing={isEditing}
        isCreatingModel={isCreatingModel}
        currentProtocol={currentProtocol}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="protocols">Protocolos</TabsTrigger>
          {isAdmin && <TabsTrigger value="models">Modelos</TabsTrigger>}
        </TabsList>

        <TabsContent value="protocols" className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, CPF ou protocolo..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-4">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtros e ordenação</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuCheckboxItem
                checked={isGroupedByClient}
                onSelect={(e) => {
                  e.preventDefault();
                  toggleGrouping();
                }}
              >
                Agrupar por cliente
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={showHighValueOnly}
                onSelect={(e) => {
                  e.preventDefault();
                  setShowHighValueOnly(!showHighValueOnly);
                  localStorage.setItem('protocols_showHighValueOnly', JSON.stringify(!showHighValueOnly));
                }}
              >
                Apenas alto valor
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              
              <DropdownMenuCheckboxItem
                checked={sortField === "name"}
                onSelect={(e) => {
                  e.preventDefault();
                  setSortField("name");
                  localStorage.setItem('protocols_sortField', JSON.stringify("name"));
                }}
              >
                Nome do cliente
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={sortField === "value"}
                onSelect={(e) => {
                  e.preventDefault();
                  setSortField("value");
                  localStorage.setItem('protocols_sortField', JSON.stringify("value"));
                }}
              >
                Valor do protocolo
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Direção</DropdownMenuLabel>
              
              <DropdownMenuCheckboxItem
                checked={sortOrder === "asc"}
                onSelect={(e) => {
                  e.preventDefault();
                  setSortOrder("asc");
                  localStorage.setItem('protocols_sortOrder', JSON.stringify("asc"));
                }}
              >
                Crescente
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={sortOrder === "desc"}
                onSelect={(e) => {
                  e.preventDefault();
                  setSortOrder("desc");
                  localStorage.setItem('protocols_sortOrder', JSON.stringify("desc"));
                }}
              >
                Decrescente
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

          <Card>
            <CardHeader>
              <CardTitle>Protocolos de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[50vh] items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Carregando protocolos...</p>
                  </div>
                </div>
              ) : protocols.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">Nenhum protocolo cadastrado</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Clique no botão "Criar Protocolo" para adicionar seu primeiro protocolo.
                      </p>
                    </div>
                    {canCreate && (
                      <Button onClick={() => setIsCreating(true)} className="mt-2">
                        <Plus className="mr-2 h-4 w-4" /> Criar Protocolo
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[25%]">Cliente</TableHead>
                        <TableHead className="w-[15%]">CPF</TableHead>
                        <TableHead>Protocolo</TableHead>
                        <TableHead>Estágios</TableHead>
                        <TableHead>Valor Total</TableHead>
                        {(canUpdate || canDelete || isAdmin) && <TableHead className="text-right">Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isGroupedByClient ? (
                        // Renderização agrupada
                        Object.keys(groupedProtocols).length > 0 ? (
                          Object.entries(groupedProtocols).map(([clientId, clientProtocols]) => {
                            const firstProtocol = clientProtocols[0];
                            const isExpanded = expandedGroups[clientId] ?? false; // Por padrão, fechado
                            return (
                              <React.Fragment key={`client-group-${clientId}`}>
                                <TableRow className="bg-muted/50">
                                  <TableCell colSpan={6} className="py-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleGroup(clientId)}
                                          className="h-6 w-6 p-0"
                                        >
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </Button>
                                        <Users className="h-4 w-4" />
                                        <span className="font-medium">
                                          {firstProtocol.Client?.name || "Cliente não encontrado"}
                                        </span>
                                        <span className="text-muted-foreground">
                                          ({clientProtocols.length} protocolo{clientProtocols.length !== 1 ? 's' : ''})
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          Total: {formatCurrency(clientProtocols.reduce((total, protocol) => 
                                            total + protocol.stages.reduce((sum, stage) => sum + Number(stage.value), 0), 0
                                          ))}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                {isExpanded && clientProtocols.map((protocol) => (
                                  <TableRow key={`protocol-${protocol.id}`}>
                                    <TableCell className="font-medium text-primary pl-8">
                                      {protocol.Client?.name || "Cliente não encontrado"}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{protocol.Client?.cpf || "-"}</TableCell>
                                    <TableCell>{protocol.title}</TableCell>
                                    <TableCell>{protocol.stages.length}</TableCell>
                                    <TableCell>
                                      {formatCurrency(protocol.stages.reduce((total, stage) => total + Number(stage.value), 0))}
                                    </TableCell>
                                    {(canUpdate || canDelete || isAdmin) && (
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                          {canUpdate && (
                                            <Button variant="ghost" size="icon" onClick={() => handleEditProtocol(protocol)}>
                                              <Edit className="h-4 w-4" />
                                              <span className="sr-only">Editar</span>
                                            </Button>
                                          )}
                                          {canDelete && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="text-destructive"
                                              onClick={() => handleDeleteClick(String(protocol.id))}
                                            >
                                              <Trash className="h-4 w-4" />
                                              <span className="sr-only">Excluir</span>
                                            </Button>
                                          )}
                                        </div>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              {searchTerm
                                ? "Nenhum protocolo encontrado com esse termo de busca."
                                : "Não há protocolos para agrupar."}
                            </TableCell>
                          </TableRow>
                        )
                      ) : (
                        // Renderização normal (não agrupada)
                        paginatedRegularProtocols.length > 0 ? (
                          paginatedRegularProtocols.map((protocol) => (
                            <TableRow key={`protocol-${protocol.id}`}>
                              <TableCell className="font-medium text-primary">{protocol.Client?.name || "Cliente não encontrado"}</TableCell>
                              <TableCell className="font-mono text-sm">{protocol.Client?.cpf || "-"}</TableCell>
                              <TableCell>{protocol.title}</TableCell>
                              <TableCell>{protocol.stages.length}</TableCell>
                              <TableCell>
                                {formatCurrency(protocol.stages.reduce((total, stage) => total + Number(stage.value), 0))}
                              </TableCell>
                              {(canUpdate || canDelete || isAdmin) && (
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {canUpdate && (
                                      <Button variant="ghost" size="icon" onClick={() => handleEditProtocol(protocol)}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Editar</span>
                                      </Button>
                                    )}
                                    {canDelete && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => handleDeleteClick(String(protocol.id))}
                                      >
                                        <Trash className="h-4 w-4" />
                                        <span className="sr-only">Excluir</span>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={canUpdate || canDelete || isAdmin ? 6 : 5} className="text-center py-4">
                              {searchTerm
                                ? "Nenhum protocolo encontrado com esse termo de busca."
                                : "Não há protocolos cadastrados."}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                  
                  {regularTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {((regularCurrentPage - 1) * regularItemsPerPage) + 1} a {Math.min(regularCurrentPage * regularItemsPerPage, regularTotalItems)} de {regularTotalItems} itens
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regularGoToPage(regularCurrentPage - 1)}
                          disabled={regularCurrentPage === 1}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regularGoToPage(regularCurrentPage + 1)}
                          disabled={regularCurrentPage === regularTotalPages}
                        >
                          Próximo
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="models" className="space-y-6">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, CPF ou protocolo modelo..."
                className="pl-8 w-full"
                value={searchModelTerm}
                onChange={(e) => setSearchModelTerm(e.target.value)}
              />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Protocolos Modelo</CardTitle>
                <Button
                  onClick={() => {
                    setIsCreating(true)
                    setActiveTab("models")
                    // Definir que estamos criando um modelo
                    setIsCreatingModel(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Criar Modelo
                </Button>
              </CardHeader>
              <CardContent>
                {modelProtocols.length === 0 ? (
                  <div className="rounded-md border border-dashed p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BookTemplate className="h-10 w-10 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-medium">Nenhum protocolo modelo cadastrado</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Para definir um protocolo como modelo, vá para a aba "Protocolos" e clique em "Definir como
                          Modelo".
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome do Modelo</TableHead>
                          <TableHead>Estágios</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedModelProtocols.length > 0 ? (
                          paginatedModelProtocols.map((protocol) => (
                            <TableRow key={`model-${protocol.id}`}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {protocol.title}
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <BookTemplate className="h-3 w-3 mr-1" />
                                    Modelo
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>{protocol.stages.length}</TableCell>
                              <TableCell>
                                {formatCurrency(protocol.stages.reduce((total, stage) => total + Number(stage.value), 0))}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {canUpdate && (
                                    <Button variant="ghost" size="icon" onClick={() => handleEditModel(protocol)}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Editar</span>
                                    </Button>
                                  )}
                                  {canDelete && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive"
                                      onClick={() => handleDeleteClick(String(protocol.id))}
                                    >
                                      <Trash className="h-4 w-4" />
                                      <span className="sr-only">Excluir</span>
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                              {searchModelTerm
                                ? "Nenhum protocolo modelo encontrado com esse termo de busca."
                                : "Não há protocolos modelo cadastrados."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    
                    {modelTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Mostrando {((modelCurrentPage - 1) * modelItemsPerPage) + 1} a {Math.min(modelCurrentPage * modelItemsPerPage, modelTotalItems)} de {modelTotalItems} itens
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => modelGoToPage(modelCurrentPage - 1)}
                            disabled={modelCurrentPage === 1}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => modelGoToPage(modelCurrentPage + 1)}
                            disabled={modelCurrentPage === modelTotalPages}
                          >
                            Próximo
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Protocolo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este protocolo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProtocol}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Substituir o componente SortableStage pelo Stage normal
function Stage({ stage, index, onRemove, onChange }: {
  stage: Omit<ProtocolStage, "id" | "order">;
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof Omit<ProtocolStage, "id" | "order">, value: any) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 items-center border p-3 rounded-md">
      <div className="col-span-12 flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">Estágio {index + 1}</h4>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 px-2 text-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4 mr-1" /> Excluir
          </Button>
        </div>
      </div>
      <div className="col-span-4">
        <Label htmlFor={`stage-name-${index}`}>Nome do Estágio</Label>
        <Input
          id={`stage-name-${index}`}
          value={stage.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          placeholder="Nome do estágio"
        />
      </div>
      <div className="col-span-3">
        <Label htmlFor={`stage-value-${index}`}>Valor (R$)</Label>
        <Input
          id={`stage-value-${index}`}
          value={stage.value}
          onChange={(e) => onChange(index, "value", e.target.value)}
          placeholder="Valor (R$)"
          type="number"
          min="0"
          step="0.01"
        />
      </div>
      <div className="col-span-4">
        <Label htmlFor={`stage-interval-${index}`}>Intervalo (dias)</Label>
        <Input
          id={`stage-interval-${index}`}
          value={stage.intervalDays}
          onChange={(e) => onChange(index, "intervalDays", e.target.value)}
          placeholder="Intervalo (dias)"
          type="number"
          min="0"
        />
      </div>
    </div>
  );
}