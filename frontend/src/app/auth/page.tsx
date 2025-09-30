"use client"

import { LoginForm } from "@/src/templates/auth/components/login-form"
import { useAuth } from "@/src/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
