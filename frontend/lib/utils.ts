import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, "")
  const trimmed = numbers.slice(0, 11)
  if (trimmed.length <= 2) return trimmed
  if (trimmed.length <= 7) return `(${trimmed.slice(0,2)}) ${trimmed.slice(2)}`
  return `(${trimmed.slice(0,2)}) ${trimmed.slice(2,7)}-${trimmed.slice(7)}`
}

export function formatCPF(value: string | undefined): string {
  if (!value) return ""
  const numbers = value.replace(/\D/g, "")
  const trimmed = numbers.slice(0, 11)
  if (trimmed.length <= 3) return trimmed
  if (trimmed.length <= 6) return `${trimmed.slice(0,3)}.${trimmed.slice(3)}`
  if (trimmed.length <= 9) return `${trimmed.slice(0,3)}.${trimmed.slice(3,6)}.${trimmed.slice(6)}`
  return `${trimmed.slice(0,3)}.${trimmed.slice(3,6)}.${trimmed.slice(6,9)}-${trimmed.slice(9)}`
}

export function removeFormatting(value: string): string {
  return value.replace(/\D/g, "")
}
