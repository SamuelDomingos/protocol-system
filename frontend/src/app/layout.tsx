"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/src/contexts/auth-context"
import { AppLayout } from "@/src/components/app-layout"
import { Toaster } from "@/src/components/ui/toaster"
import { ThemeProvider } from "@/src/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Adicione o título e favicon diretamente aqui */}
        <title>Infinity Way</title>
        <link rel="icon" href="/logo_nav.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}