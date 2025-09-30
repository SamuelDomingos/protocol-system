"use client"

import { Header } from "@/src/components/header"
import { Sidebar } from "@/src/components/sidebar"
import { useAuth } from "@/src/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/auth") {
      router.push("/auth")
    }
  }, [isLoading, user, pathname, router])

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)

      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen)
  }

  if (pathname === "/auth") {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }
  
  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} isMobile={isMobile} />
        
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
}