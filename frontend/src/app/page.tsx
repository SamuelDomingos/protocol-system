"use client"

import { useAuth } from "@/src/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        switch (user.role) {
          case "admin":
            router.push("/stock")
            break
          case "doctor":
            router.push("/appointments")
            break
          case "closing":
            router.push("/protocols")
            break
          case "technique":
            router.push("/my-protocols")
            break
          case "stock":
            router.push("/stock")
            break
          default:
            router.push("/auth")
        }
      } else {
        router.push("/auth")
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <Image 
        src="/logo_nav.png" 
        alt="Logo da Infinity Way" 
        width={96} 
        height={96} 
        className="w-24 h-auto" 
      />
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
}