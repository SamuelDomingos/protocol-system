"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loginStatus, setLoginStatus] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const redirectToRolePage = () => {
        switch (user.role) {
          case "doctor":
            return "/appointments"
          case "closing":
            return "/protocols"
          case "technique":
            return "/my-protocols"
          case "stock":
            return "/stock"
          case "admin":
            return "/dashboard"
          default:
            return "/login"
        }
      }
      router.push(redirectToRolePage())
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoginStatus("Iniciando processo de login...")

    if (!username || !password) {
      setError("Preencha todos os campos")
      setLoginStatus("")
      return
    }

    try {
      setLoginStatus("Enviando credenciais para a API...")
      await login(username, password)
      setLoginStatus("Login bem-sucedido! Redirecionando...")
    } catch (err) {
      console.error("Erro capturado na página de login:", err)
      setError((err as Error).message || "Erro ao fazer login")
      setLoginStatus("")
    }
  }

  if (user) {
    return null  // O redirecionamento será feito via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Infinity Way" width={240} height={60} className="h-32 w-auto" priority />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sistema Infinity Way</CardTitle>
          <CardDescription className="text-center">Entre com suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loginStatus && !error && (
            <Alert className="mb-4">
              <AlertDescription>{loginStatus}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Seu nome de usuário"
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[35px]"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
