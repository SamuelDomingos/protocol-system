import { useAuth } from "@/src/contexts/auth-context"
import { Button } from "@/src/components/ui/button"
import { LogOut, Menu, Moon, Sun, Lightbulb, Send } from "lucide-react"
import { useTheme } from "next-themes"

interface User {
  id: number | string
  name: string
  role: string
}

interface HeaderProps {
  onToggleSidebar: () => void
  isMobile: boolean
}

export function Header({ onToggleSidebar, isMobile }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b bg-background px-4 py-3 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <h1 className="text-lg font-semibold">Sistema da Infinity Way</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Olá, {user?.name}</span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={logout} title="Sair">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}