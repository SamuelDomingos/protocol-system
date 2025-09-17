"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Lock, User, Shield, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/services/api"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Interface para usuário
interface UserData {
  id: string
  name: string
  role: string
  active?: boolean
}

// Interface para permissões
interface Permission {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  allowedPages: string[]
}

interface Permissions {
  clients: Permission
  protocols: Permission
  applications: Permission
  users: Permission
  stock: Permission
}

// Módulos disponíveis com suas páginas
const MODULES = [
  { 
    id: "clients", 
    label: "Clientes",
    description: "Gerenciamento de clientes e agendamentos",
    pages: [
      { id: "/appointments", label: "Agendamentos" }
    ]
  },
  { 
    id: "protocols", 
    label: "Protocolos",
    description: "Gerenciamento de protocolos de tratamento",
    pages: [
      { id: "/protocols", label: "Lista de Protocolos" }
    ]
  },
  { 
    id: "applications", 
    label: "Aplicações",
    description: "Gerenciamento de aplicações de protocolos",
    pages: [
      { id: "/my-protocols", label: "Meus Protocolos" },
      { id: "/applications/:id", label: "Detalhes da Aplicação" }
    ]
  },
  { 
    id: "users", 
    label: "Usuários",
    description: "Gerenciamento de usuários do sistema",
    pages: [
      { id: "/users", label: "Lista de Usuários" },
      { id: "/users/:id", label: "Detalhes do Usuário" }
    ]
  },
  {
    id: "stock",
    label: "Estoque",
    description: "Visualização de dados de estoque",
    pages: [
      { id: "/stock", label: "Estoque" }
    ]
  }
]

export default function UserPermissionsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserData | null>(null)
  const [permissions, setPermissions] = useState<Permissions>({
    clients: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
    protocols: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
    applications: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
    users: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
    stock: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [activeTab, setActiveTab] = useState("info")
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const userId = params.id as string
        const userData = await authService.getUser(userId)
        setUser(userData)

        try {
          const response = await authService.getUserPermissions(userId)
          setPermissions(response.permissions)
        } catch (error) {
          console.error("Erro ao carregar permissões:", error)
          // Permissões vazias já estão definidas no estado inicial
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do usuário.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [params.id, toast])

  const handlePermissionChange = (module: string, action: keyof Permission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module as keyof Permissions],
        [action]: value
      }
    }))
  }

  const handlePagePermissionChange = (module: string, page: string, checked: boolean) => {
    setPermissions(prev => {
      const modulePermission = prev[module as keyof Permissions];
      // Garantir que currentPages seja sempre um array
      const currentPages = Array.isArray(modulePermission.allowedPages) 
        ? modulePermission.allowedPages 
        : [];
      
      return {
        ...prev,
        [module]: {
          ...modulePermission,
          allowedPages: checked 
            ? [...currentPages, page]
            : currentPages.filter(p => p !== page)
        }
      };
    });
  };

  const handleSavePermissions = async () => {
    if (!user) return

    try {
      setIsSubmitting(true)
      // Transformar o objeto de permissões em array para a API
      const permissionsArray = Object.entries(permissions).map(([module, perms]) => ({
        module,
        ...perms,
        // Garantir que allowedPages seja um array de strings
        allowedPages: Array.isArray(perms.allowedPages) 
          ? perms.allowedPages 
          : typeof perms.allowedPages === 'string'
            ? JSON.parse(perms.allowedPages.replace(/\\/g, ''))
            : []
      }))
      
      console.log('Enviando permissões para API:', permissionsArray)
      const response = await authService.updatePermissions(user.id, permissionsArray)
      
      if (response) {
        setShowSuccessAlert(true)
        // Esconde o alerta após 3 segundos
        setTimeout(() => {
          setShowSuccessAlert(false)
        }, 3000)
      } else {
        throw new Error("Falha ao atualizar permissões")
      }
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

  const handleChangePassword = async () => {
    if (!user || !newPassword) return

    try {
      setIsSubmitting(true)
      await authService.updateUser(user.id, { password: newPassword })
      
      toast({
        title: "Senha atualizada",
        description: "A senha do usuário foi atualizada com sucesso.",
      })
      setIsPasswordDialogOpen(false)
      setNewPassword("")
    } catch (error) {
      console.error("Erro ao atualizar senha:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a senha.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-muted-foreground">Usuário não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuário</h1>
          <p className="text-muted-foreground">Gerencie as informações e permissões do usuário.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      {showSuccessAlert && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
          <AlertDescription className="text-green-700">
            As permissões do usuário foram atualizadas com sucesso.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Nome</TableCell>
                    <TableCell>{user.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cargo</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ações</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPasswordDialogOpen(true)}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Alterar Senha
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Permissões de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MODULES.map((module) => {
                  const modulePermission = permissions[module.id as keyof Permissions] || {
                    canCreate: false,
                    canRead: false,
                    canUpdate: false,
                    canDelete: false,
                    allowedPages: []
                  };

                  return (
                    <div key={module.id} className="flex flex-col border-b py-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={modulePermission.canRead}
                            onCheckedChange={(checked) => {
                              handlePermissionChange(module.id, "canRead", checked);
                              if (!checked) {
                                handlePermissionChange(module.id, "canCreate", false);
                                handlePermissionChange(module.id, "canUpdate", false);
                                handlePermissionChange(module.id, "canDelete", false);
                              }
                            }}
                          />
                          <div>
                            <Label className="text-sm font-medium">{module.label}</Label>
                            <p className="text-xs text-muted-foreground">{module.description}</p>
                          </div>
                        </div>

                        {modulePermission.canRead && (
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`${module.id}-create`}
                                checked={modulePermission.canCreate}
                                onCheckedChange={(checked) => handlePermissionChange(module.id, "canCreate", checked)}
                              />
                              <Label htmlFor={`${module.id}-create`} className="text-xs">Criar</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`${module.id}-update`}
                                checked={modulePermission.canUpdate}
                                onCheckedChange={(checked) => handlePermissionChange(module.id, "canUpdate", checked)}
                              />
                              <Label htmlFor={`${module.id}-update`} className="text-xs">Editar</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`${module.id}-delete`}
                                checked={modulePermission.canDelete}
                                onCheckedChange={(checked) => handlePermissionChange(module.id, "canDelete", checked)}
                              />
                              <Label htmlFor={`${module.id}-delete`} className="text-xs">Excluir</Label>
                            </div>
                          </div>
                        )}
                      </div>

                      {modulePermission.canRead && module.pages && module.pages.length > 0 && (
                        <div className="mt-3 pl-8 border-t pt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Páginas permitidas:</p>
                          <div className="flex flex-wrap gap-6">
                            {module.pages.map((page) => (
                              <div key={page.id} className="flex items-center gap-2">
                                <Switch
                                  checked={modulePermission.allowedPages?.includes(page.id) || false}
                                  onCheckedChange={(checked) => handlePagePermissionChange(module.id, page.id, checked)}
                                />
                                <Label className="text-xs">{page.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="sm" onClick={handleSavePermissions} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={isSubmitting || !newPassword}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 