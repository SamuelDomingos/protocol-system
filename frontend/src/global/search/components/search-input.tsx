"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  onClear?: () => void
  showClearButton?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Pesquisar...",
  className,
  disabled = false,
  onClear,
  showClearButton = true,
}: SearchInputProps) {
  const handleClear = () => {
    onChange("")
    onClear?.()
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="pl-10 pr-10"
      />
      {showClearButton && value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 h-8 w-8 p-0"
          onClick={handleClear}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpar pesquisa</span>
        </Button>
      )}
    </div>
  )
}