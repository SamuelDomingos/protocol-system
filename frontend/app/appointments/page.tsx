"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"
import { type Client, clientsService } from "@/services/clients-api"
import { Loader2, Plus, Search, Edit, Trash, Phone, BookMinus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PaginationControls } from "@/components/ui/data-table"
import { usePagination } from "@/hooks/use-pagination"

export default function AppointmentsPage() {
  const { user } = useAuth()
  const { getModulePermissions } = usePermissions()
  const { toast } = useToast()

  // Estado para clientes
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<number | string | null>(null)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateClient, setDuplicateClient] = useState<Client | null>(null)

  const [phoneRaw, setPhoneRaw] = useState(currentClient?.phone || "")
  const [cpfRaw, setCpfRaw] = useState(currentClient?.cpf || "")

  // Obter permissões do módulo de clientes
  const { canView, canCreate, canUpdate, canDelete } = getModulePermissions("clients")

  useEffect(() => {
    if (currentClient) {
      setPhoneRaw(currentClient.phone || "")
      setPhoneDisplay(formatPhoneNumber(currentClient.phone || ""))
  
      setCpfRaw(currentClient.cpf || "")
      setCpfDisplay(formatCPF(currentClient.cpf || ""))
    }
  }, [currentClient])  

  // Carregar clientes ao montar o componente
  useEffect(() => {
    if (canView) {
      fetchClients()
    }
  }, [canView])

  // Função para buscar clientes
  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const data = await clientsService.listClients()
      setClients(data)
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar clientes com base no termo de pesquisa
  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      client.name.toLowerCase().includes(searchLower) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.cpf && client.cpf.includes(searchTerm))
    )
  })

  // Usar o hook de paginação universal
  const {
    currentPage,
    totalPages,
    goToPage,
    paginatedItems: currentPageClients,
    totalItems,
    itemsPerPage
  } = usePagination({
    items: filteredClients,
    itemsPerPage: 20
  })

  // Funções para gerenciar clientes
  const handleAddClient = () => {
    if (!canCreate) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para criar clientes.",
        variant: "destructive",
      })
      return
    }

    setIsEditMode(false)
    setCurrentClient({
      name: "",
      phone: "",
      cpf: "",
      observation: "",
    })
    setIsClientDialogOpen(true)
  }

  const handleEditClient = (client: Client) => {
    if (!canUpdate) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para editar clientes.",
        variant: "destructive",
      })
      return
    }

    setIsEditMode(true)
    setCurrentClient({ ...client })
    setIsClientDialogOpen(true)
  }

  const handleDeleteClick = (id: number | string) => {
    if (!canDelete) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para excluir clientes.",
        variant: "destructive",
      })
      return
    }

    setClientToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return

    try {
      setIsSubmitting(true)
      await clientsService.deleteClient(clientToDelete)

      // Atualizar a lista de clientes
      setClients(clients.filter((client) => client.id !== clientToDelete))

      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir cliente:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setDeleteDialogOpen(false)
      setClientToDelete(null)
    }
  }

  const handleSaveClient = async () => {
    if (!currentClient.name) {
      toast({
        title: "Erro ao salvar",
        description: "Nome é um campo obrigatório.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Verificar se já existe um cliente com o mesmo nome
      const existingClient = clients.find(
        (client) =>
          client.name.toLowerCase() === currentClient.name?.toLowerCase() &&
          client.id !== currentClient.id
      )

      if (existingClient && !isEditMode) {
        // Se for uma criação nova e já existir um cliente com o mesmo nome
        setDuplicateClient(existingClient)
        setDuplicateDialogOpen(true)
        setIsSubmitting(false)
        return
      }

      await saveClientData()
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cliente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveClientData = async () => {
    if (isEditMode && currentClient.id) {
      // Atualizar cliente existente
      const updatedClient = await clientsService.updateClient(currentClient.id, {
        name: currentClient.name || "",
        phone: phoneRaw,
        cpf: cpfRaw,
        observation: currentClient.observation,
      })

      // Atualizar a lista localmente
      setClients(clients.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      ))

      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso.",
      })
    } else {
      // Adicionar novo cliente
      const newClient = await clientsService.createClient({
        name: currentClient.name || "",
        phone: phoneRaw,
        cpf: cpfRaw,
        observation: currentClient.observation,
      })

      // Adicionar o novo cliente à lista
      setClients([...clients, newClient])

      toast({
        title: "Cliente adicionado",
        description: "O novo cliente foi adicionado com sucesso.",
      })
    }

    setIsClientDialogOpen(false)
    setDuplicateDialogOpen(false)
    setDuplicateClient(null)
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    const trimmed = numbers.slice(0, 11)
    if (trimmed.length <= 2) return trimmed
    if (trimmed.length <= 7) return `(${trimmed.slice(0,2)}) ${trimmed.slice(2)}`
    return `(${trimmed.slice(0,2)}) ${trimmed.slice(2,7)}-${trimmed.slice(7)}`
  }
  
  const formatCPF = (value: string | undefined) => {
    if (!value) return ""
    const numbers = value.replace(/\D/g, "")
    const trimmed = numbers.slice(0, 11)
    if (trimmed.length <= 3) return trimmed
    if (trimmed.length <= 6) return `${trimmed.slice(0,3)}.${trimmed.slice(3)}`
    if (trimmed.length <= 9) return `${trimmed.slice(0,3)}.${trimmed.slice(3,6)}.${trimmed.slice(6)}`
    return `${trimmed.slice(0,3)}.${trimmed.slice(3,6)}.${trimmed.slice(6,9)}-${trimmed.slice(9)}`
  }  

  const [phoneDisplay, setPhoneDisplay] = useState(formatPhoneNumber(phoneRaw))
  const [cpfDisplay, setCpfDisplay] = useState(formatCPF(cpfRaw))

  // Se o usuário não tem permissão para ver clientes, mostrar mensagem
  if (!canView) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para visualizar esta página.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Atendimentos</h1>
        <p className="text-muted-foreground">Gerencie seus atendimentos e cadastre novos clientes.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cadastro de Clientes</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cliente..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {canCreate && (
              <Button onClick={handleAddClient}>
                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageClients.length > 0 ? (
                    currentPageClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {formatPhoneNumber(client.phone)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <BookMinus className="h-4 w-4 text-muted-foreground" />
                            {formatCPF(client.cpf)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">{client.observation || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdate && (
                              <Button variant="ghost" size="icon" onClick={() => handleEditClient(client)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDeleteClick(client.id)}
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
                      <TableCell colSpan={5} className="text-center py-4">
                        {searchTerm
                          ? "Nenhum cliente encontrado com esse termo de busca."
                          : "Nenhum cliente cadastrado."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Componente de paginação universal */}
              {filteredClients.length > 0 && (
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

      {/* Diálogo de cliente */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={currentClient?.name || ""}
                onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phoneDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "")
                  setPhoneRaw(raw)
                  setPhoneDisplay(formatPhoneNumber(raw))
                  // Atualiza o currentClient sem máscara
                  setCurrentClient({ ...currentClient, phone: raw })
                }}
                placeholder="(99) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={cpfDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "")
                  setCpfRaw(raw)
                  setCpfDisplay(formatCPF(raw))
                  // Atualiza o currentClient sem máscara
                  setCurrentClient({ ...currentClient, cpf: raw })
                }}
                placeholder="999.999.999-99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observation">Observação</Label>
              <Textarea
                id="observation"
                value={currentClient?.observation || ""}
                onChange={(e) => setCurrentClient({ ...currentClient, observation: e.target.value })}
                placeholder="Informações adicionais sobre o cliente"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClientDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSaveClient} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditMode ? (
                "Salvar Alterações"
              ) : (
                "Adicionar Cliente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
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

      {/* Diálogo de confirmação para cliente duplicado */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cliente com nome duplicado</AlertDialogTitle>
            <AlertDialogDescription>
              Já existe um cliente cadastrado com o nome "{duplicateClient?.name}". 
              Deseja criar um novo cliente com o mesmo nome?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={saveClientData}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar mesmo assim"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}