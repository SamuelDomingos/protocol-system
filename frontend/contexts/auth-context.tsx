"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/services/api"
import { getToken, isTokenExpired } from "@/services/api-utils"

// Define user roles
type UserRole = "doctor" | "closing" | "stock" | "admin" | "technique"

// Map API roles to system roles (keys are lowercase)
const roleMapping: Record<string, UserRole> = {
  doctor: "doctor",
  closing: "closing",
  technique: "technique",
  stock: "stock",
  admin: "admin",
}

// Define module permissions
export interface ModulePermission {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  allowedPages: string[]
}

// Define all available modules
export interface Permissions {
  clients: ModulePermission
  protocols: ModulePermission
  applications: ModulePermission
  users: ModulePermission
  stock: ModulePermission
}

// Define user type
export interface User {
  id: string
  name: string
  role: UserRole
  token: string
  permissions: Permissions
}

// Define context type
interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
  hasPermission: (module: keyof Permissions, action: keyof ModulePermission) => boolean
  hasPageAccess: (page: string) => boolean
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Key for localStorage
const USER_STORAGE_KEY = "sistema_protocolo_user"

// Public routes that don't require authentication
const publicRoutes = ['/login']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = Boolean(user)

  // Verificar token periodicamente
  useEffect(() => {
    if (!user) return

    const checkToken = () => {
      const token = getToken()
      if (!token || isTokenExpired(token)) {
        logout()
      }
    }

    // Verificar a cada 5 minutos
    const interval = setInterval(checkToken, 5 * 60 * 1000)

    // Verificar também quando a janela recebe foco
    const handleFocus = () => {
      checkToken()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  // Verificar token ao carregar
  const verifyToken = async () => {
    try {
      const token = getToken()
      if (!token) {
        return false
      }

      if (isTokenExpired(token)) {
        return false
      }

      // Opcional: Verificar com o backend se o token ainda é válido
      try {
        await authService.verifyToken()
        return true
      } catch (error) {
        console.error("Erro ao verificar token com o backend:", error)
        return false
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error)
      return false
    }
  }

  // Atualizar o estado inicial das permissões
  const [permissions, setPermissions] = useState<Permissions>({
    clients: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
    protocols: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
    applications: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
    users: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
    stock: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] }
  })

  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
      
      const response = await authService.login(username, password)
      if (!response.token) throw new Error('Token não encontrado na resposta')
  
      const userRole = mapRole(response.user.role)
      
      // Criar usuário temporário com token
      const tempUser: User = {
        id: response.user.id || 'user-id',
        token: response.token,
        name: response.user.name || username,
        role: userRole,
        permissions: {
          clients: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
          protocols: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
          applications: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
          users: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] },
          stock: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, allowedPages: [] }
        }
      }

      // Salvar usuário temporário no localStorage para ter o token disponível
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tempUser))
      
      // Agora que o token está salvo, podemos buscar as permissões
      const responsePermissions = await authService.getUserPermissions(response.user.id)
      console.log('Permissões do backend:', responsePermissions)
      
      if (!responsePermissions) {
        throw new Error('Não foi possível carregar as permissões do usuário')
      }

      // Usar diretamente as permissões do backend sem aninhamento extra
      const newUser: User = {
        id: response.user.id || 'user-id',
        token: response.token,
        name: response.user.name || username,
        role: userRole,
        permissions: responsePermissions.permissions // Acessando diretamente o objeto permissions
      }
  
      console.log('Usuário final:', newUser)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
      setUser(newUser)
      router.replace(getRedirectPath(userRole))
    } catch (e) {
      localStorage.removeItem(USER_STORAGE_KEY)
      throw e
    }
  }

  // Atualize o useEffect de carregamento inicial
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem(USER_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          const isValid = await verifyToken()
          
          if (isValid) {
            const mappedRole = mapRole(parsed.role)

            const userPermissions = await authService.getUserPermissions(parsed.id)
            
            if (!userPermissions) {
              console.error('Não foi possível carregar as permissões do usuário')
              logout()
              return
            }

            const updatedUser = {
              ...parsed,
              role: mappedRole,
              permissions: userPermissions.permissions // Acessando diretamente o objeto permissions
            }
            setUser(updatedUser)
          } else {
            logout()
          }
        }
      } catch (e) {
        console.error('Erro ao carregar usuário:', e)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Redirect based on auth status and route
  useEffect(() => {
    if (!isLoading) {
      const isPublic = publicRoutes.includes(pathname)
      if (!isAuthenticated && !isPublic) {
        router.replace('/login')
      } else if (isAuthenticated && isPublic) {
        // Only redirect admin to dashboard, others go to their own pages
        if (user?.role === 'admin') {
          router.replace('/dashboard')
        } else {
          router.replace(getRedirectPath(user!.role))
        }
      }
    }
  }, [isLoading, isAuthenticated, pathname, router, user])

  // Map API role to system role (case-insensitive)
  const mapRole = (apiRole: string): UserRole => {
    const key = apiRole.toString().toLowerCase()
    if (key in roleMapping) {
      return roleMapping[key]
    }
    console.warn(`Role não mapeada: ${apiRole}. Usando 'closing' como padrão.`)
    return 'closing'
  }

  // Determine redirect path based on role
  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case 'doctor': return '/appointments'
      case 'closing': return '/protocols'
      case 'technique': return '/my-protocols'
      case 'stock': return '/stock'
      case 'admin': return '/dashboard'
      default: return '/login'
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    router.replace('/login')
  }

  // Check permission
  const hasPermission = (module: keyof Permissions, action: keyof ModulePermission): boolean => {
    if (!user || !user.permissions) return false
    const modulePermission = user.permissions[module]
    if (!modulePermission) return false
    return modulePermission[action] as boolean
  }

  // Check page access
  const hasPageAccess = (page: string): boolean => {
    if (!user) return false
    
    return Object.entries(user.permissions).some(([_, permissions]) => {
      if (!permissions || !permissions.allowedPages) return false
      
      // Garantir que allowedPages seja um array
      const allowedPages = typeof permissions.allowedPages === 'string' 
        ? JSON.parse(permissions.allowedPages)
        : permissions.allowedPages

      if (!Array.isArray(allowedPages)) return false
      
      return allowedPages.some((allowedPage: string) => {
        const pattern = allowedPage.replace(/:[^/]+/g, '[^/]+')
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(page)
      })
    })
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      isAuthenticated, 
      hasPermission,
      hasPageAccess 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
