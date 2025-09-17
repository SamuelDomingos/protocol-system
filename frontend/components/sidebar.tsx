"use client"

import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, ClipboardList, FileText, Package, Home, Users2, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageBox } from "./message-box"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile: boolean
}

interface NavLink {
  href: string
  label: string
  icon: any
  module: keyof import("@/contexts/auth-context").Permissions
  adminOnly?: boolean
  skipPermissionCheck?: boolean
}

export function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  const { user, hasPermission, hasPageAccess } = useAuth()
  const pathname = usePathname()
  

  // Define navigation links based on user permissions
  const getNavLinks = (): NavLink[] => {
    const links: NavLink[] = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: Home,
        module: "clients",
        adminOnly: true,
        skipPermissionCheck: true // Pula a verificação de permissão do módulo
      },
      {
        href: "/appointments",
        label: "Clientes",
        icon: Users,
        module: "clients"
      },
      {
        href: "/protocols",
        label: "Protocolos",
        icon: ClipboardList,
        module: "protocols"
      },
      {
        href: "/my-protocols",
        label: "Meus Protocolos",
        icon: FileText,
        module: "applications"
      },
      {
        href: "/stock",
        label: "Estoque",
        icon: Package,
        module: "stock"
      },
      {
        href: "/users",
        label: "Usuários",
        icon: Users2,
        module: "users"
      }
    ]

    return links.filter(link => {
      
      // Se for adminOnly, só mostra para admin
      if (link.adminOnly && user?.role !== 'admin') {
        return false
      }

      // Se skipPermissionCheck for true, não verifica permissões do módulo
      if (link.skipPermissionCheck) {
        return true
      }

      // Verifica se o usuário tem permissão de leitura para o módulo
      const modulePermissions = user?.permissions[link.module]
      
      if (!modulePermissions) {
        return false
      }

      // Verifica se o usuário tem permissão de leitura para o módulo
      if (!modulePermissions.canRead) {
        return false
      }

      // Verifica se o usuário tem permissão para a página específica
      let allowedPages: string[] = []
      
      try {
        // Tenta fazer o parse da string JSON, removendo as camadas extras de escape
        const rawPages = modulePermissions.allowedPages as string | string[]
        if (typeof rawPages === 'string') {
          // Remove as camadas extras de escape
          const cleanString = rawPages.replace(/\\/g, '')
          allowedPages = JSON.parse(cleanString)
        } else if (Array.isArray(rawPages)) {
          allowedPages = rawPages
        }
      } catch (error) {
        console.error('Erro ao fazer parse das páginas permitidas:', error)
        return false
      }

      if (!Array.isArray(allowedPages)) {
        return false
      }

      // Verifica se a página atual está nas páginas permitidas
      const hasAccess = allowedPages.some(allowedPage => {
        const pattern = allowedPage.replace(/:[^/]+/g, '[^/]+')
        const regex = new RegExp(`^${pattern}$`)
        const matches = regex.test(link.href)
        return matches
      })

      return hasAccess
    })
  }

  const navLinks = getNavLinks()

  // Determinar a largura da barra lateral com base no estado
  const sidebarWidth = isOpen ? "w-64" : "w-20"

  // Classe para o backdrop em dispositivos móveis
  const backdropClass = isMobile && isOpen ? "fixed inset-0 bg-black/50 z-40" : "hidden"

  return (
    <>
      {/* Backdrop para dispositivos móveis */}
      {isMobile && <div className={backdropClass} onClick={onToggle} />}

      {/* Barra lateral */}
      <aside
        className={cn(
          "bg-sidebar border-sidebar-border text-sidebar-foreground transition-all duration-300 ease-in-out z-50 flex flex-col h-full",
          sidebarWidth,
          isMobile ? (isOpen ? "fixed inset-y-0 left-0" : "hidden") : "relative",
        )}
      >
        {/* Header with logo and toggle button */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center">
            {isOpen ? (
                <Image src="/logo.png" alt="Infinity Way" width={160} height={40} className="h-20 w-auto" />
            ) : (
                <Image src="/logo.png" alt="Infinity Way" width={40} height={40} className="h-8 w-auto" />
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle} 
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main navigation section */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === link.href 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    !isOpen && "justify-center px-2",
                  )}
                  title={!isOpen ? link.label : undefined}
                >
                  <link.icon className="h-5 w-5" />
                  {isOpen && <span>{link.label}</span>}
                </Link>
              </li>
            ))}
          </ul>          
        </nav>

        {/* Message box at the bottom */}
        <div className="mt-auto border-t border-sidebar-border">
          <MessageBox isOpen={isOpen} />
        </div>
      </aside>
    </>
  )
}