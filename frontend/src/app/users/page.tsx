"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useAuth } from "@/src/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/components/ui/use-toast"
import { Edit, Trash, UserPlus, Loader2, Key } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { authService } from "@/services/api"
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
import { Checkbox } from "@/src/components/ui/checkbox"
import { Switch } from "@/src/components/ui/switch"
import { Separator } from "@/src/components/ui/separator"

// Interface para usuário
interface UserData {
  id: string
  name: string
  role: string
  active?: boolean
}

// Interface para permissões
interface Permission {
  module: string
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

// Módulos disponíveis
const MODULES = [
  { id: "clients", label: "Clientes" },
  { id: "protocols", label: "Protocolos" },
  { id: "applications", label: "Aplicações" },
  { id: "messages", label: "Mensagens" },
  { id: "users", label: "Usuários" },
]

export default function UsersPage() {
  const { user, hasPermission } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentUser, setCurrentUser] = useState<{
    id: string
    name: string
    role: string
    password?: string
    active?: boolean
  } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<Permission[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Carregar usuários ao montar o componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const data = await authService.listUsers()
        // Adaptar os dados conforme necessário
        const formattedUsers = Array.isArray(data)
          ? data.map((user: any) => ({
              id: user.id || user._id,
              name: user.name,
              role: user.role,
              active: true, // Assumindo que todos os usuários estão ativos por padrão
            }))
          : []
          setUsers(formattedUsers)
      } catch (error) {
        console.error("Erro ao carregar usuários:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (hasPermission("users", "canRead")) {
      fetchUsers()
    } else {
      setShouldRedirect(true)
    }
  }, [user, toast, hasPermission])

  // Efeito para redirecionamento
  useEffect(() => {
    if (shouldRedirect) {
      router.push("/dashboard")
    }
  }, [shouldRedirect, router])

  // Se estiver carregando ou redirecionando, não renderiza nada
  if (isLoading || shouldRedirect) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleAddUser = () => {
    setIsEditMode(false)
    setCurrentUser({
      id: "",
      name: "",
      role: "",
      password: "",
      active: true,
    })
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: UserData) => {
    setIsEditMode(true)
    setCurrentUser({ ...user, password: "" })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setIsSubmitting(true)
      await authService.deleteUser(userToDelete)

      // Atualizar a lista de usuários
      setUsers(users.filter((user) => user.id !== userToDelete))

      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleSaveUser = async () => {
    if (!currentUser) return

    if (!currentUser.name || !currentUser.role) {
      toast({
        title: "Erro ao salvar",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (!isEditMode && !currentUser.password) {
      toast({
        title: "Erro ao salvar",
        description: "A senha é obrigatória para novos usuários.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      if (isEditMode) {
        // Atualizar usuário existente
        const userData = {
          name: currentUser.name,
          role: currentUser.role,
          ...(currentUser.password ? { password: currentUser.password } : {}),
        }

        await authService.updateUser(currentUser.id, userData)

        // Atualizar a lista localmente
        setUsers(
          users.map((user) =>
            user.id === currentUser.id ? { ...user, name: currentUser.name, role: currentUser.role } : user,
          ),
        )

        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        })
      } else {
        // Adicionar novo usuário
        const userData = {
          name: currentUser.name,
          password: currentUser.password || "",
          role: currentUser.role,
        }

        const newUser = await authService.signup(userData)

        // Adicionar o novo usuário à lista
        setUsers([
          ...users,
          {
            id: newUser.id || newUser._id,
            name: newUser.name,
            role: newUser.role,
            active: true,
          },
        ])

        toast({
          title: "Usuário adicionado",
          description: "O novo usuário foi adicionado com sucesso.",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenPermissions = async (userId: string) => {
    try {
      let permissions;
      try {
        permissions = await authService.listPermissions(userId);
      } catch (error) {
        // Se der erro 404 (nenhuma permissão encontrada), criamos permissões vazias
        permissions = MODULES.map(module => ({
          module: module.id,
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false
        }));
      }

      // Se não houver permissões, cria um array vazio com os módulos disponíveis
      if (!permissions || permissions.length === 0) {
        permissions = MODULES.map(module => ({
          module: module.id,
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false
        }));
      }

      setSelectedUserPermissions(permissions);
      setSelectedUserId(userId);
      setIsPermissionsDialogOpen(true);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as permissões do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUserId) return

    try {
      setIsSubmitting(true)
      await authService.updatePermissions(selectedUserId, selectedUserPermissions)
      
      toast({
        title: "Permissões atualizadas",
        description: "As permissões do usuário foram atualizadas com sucesso.",
      })
      setIsPermissionsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar permissões:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as permissões.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePermissionChange = (module: string, action: keyof Omit<Permission, "module">, value: boolean) => {
    setSelectedUserPermissions(prev => {
      const moduleIndex = prev.findIndex(p => p.module === module)
      if (moduleIndex === -1) {
        return [...prev, { module, canCreate: false, canRead: false, canUpdate: false, canDelete: false, [action]: value }]
      }
      const newPermissions = [...prev]
      newPermissions[moduleIndex] = { ...newPermissions[moduleIndex], [action]: value }
      return newPermissions
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "doctor":
        return <Badge className="bg-blue-500">Médico</Badge>
      case "closing":
        return <Badge className="bg-green-500">Fechamento</Badge>
      case "technique":
        return <Badge className="bg-purple-500">Enfermeira</Badge>
      case "stock":
        return <Badge className="bg-amber-500">Estoque</Badge>
      case "admin":
        return <Badge className="bg-red-500">Gestor</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema e suas permissões.</p>
        </div>
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow 
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(user);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(user.id);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Usuário" : "Adicionar Usuário"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={currentUser?.name || ""}
                onChange={(e) => setCurrentUser(currentUser ? { ...currentUser, name: e.target.value } : null)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Select
                value={currentUser?.role || ""}
                onValueChange={(value) => setCurrentUser(currentUser ? { ...currentUser, role: value } : null)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Médico</SelectItem>
                  <SelectItem value="closing">Fechamento</SelectItem>
                  <SelectItem value="technique">Enfermeira</SelectItem>
                  <SelectItem value="stock">Estoque</SelectItem>
                  <SelectItem value="admin">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha {isEditMode && "(deixe em branco para manter a atual)"}</Label>
              <Input
                id="password"
                type="password"
                value={currentUser?.password || ""}
                onChange={(e) => setCurrentUser(currentUser ? { ...currentUser, password: e.target.value } : null)}
                placeholder={isEditMode ? "••••••••" : "Digite a senha"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditMode ? (
                "Salvar Alterações"
              ) : (
                "Adicionar Usuário"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Permissões</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Defina quais módulos o usuário terá acesso e quais ações poderá realizar.
            </p>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {MODULES.map((module) => {
              const modulePermission = selectedUserPermissions.find(p => p.module === module.id) || {
                module: module.id,
                canCreate: false,
                canRead: false,
                canUpdate: false,
                canDelete: false
              };

              return (
                <div key={module.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{module.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir acesso a este módulo
                      </p>
                    </div>
                    <Switch
                      checked={modulePermission.canRead}
                      onCheckedChange={(checked) => {
                        // Se desativar o módulo, desativa todas as permissões
                        handlePermissionChange(module.id, "canRead", checked);
                        if (!checked) {
                          handlePermissionChange(module.id, "canCreate", false);
                          handlePermissionChange(module.id, "canUpdate", false);
                          handlePermissionChange(module.id, "canDelete", false);
                        }
                      }}
                    />
                  </div>

                  {modulePermission.canRead && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Criar</Label>
                            <p className="text-sm text-muted-foreground">
                              Permitir criar novos registros
                            </p>
                          </div>
                          <Switch
                            checked={modulePermission.canCreate}
                            onCheckedChange={(checked) => handlePermissionChange(module.id, "canCreate", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Atualizar</Label>
                            <p className="text-sm text-muted-foreground">
                              Permitir modificar registros existentes
                            </p>
                          </div>
                          <Switch
                            checked={modulePermission.canUpdate}
                            onCheckedChange={(checked) => handlePermissionChange(module.id, "canUpdate", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Excluir</Label>
                            <p className="text-sm text-muted-foreground">
                              Permitir remover registros
                            </p>
                          </div>
                          <Switch
                            checked={modulePermission.canDelete}
                            onCheckedChange={(checked) => handlePermissionChange(module.id, "canDelete", checked)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSavePermissions} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Permissões"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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
