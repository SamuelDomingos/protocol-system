"use client"

import { useState, useCallback } from "react"
import { useDebounce } from "@/src/hooks/use-debounce"

interface UseSearchOptions {
  debounceMs?: number
  initialValue?: string
  onSearch?: (term: string) => void
}

interface UseSearchReturn {
  searchTerm: string
  debouncedSearchTerm: string
  setSearchTerm: (term: string) => void
  clearSearch: () => void
  isSearching: boolean
}

export function useSearch({
  debounceMs = 300,
  initialValue = "",
  onSearch,
}: UseSearchOptions = {}): UseSearchReturn {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchTerm("")
    onSearch?.("")
  }, [onSearch])

  const isSearching = searchTerm !== debouncedSearchTerm

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm: handleSetSearchTerm,
    clearSearch,
    isSearching,
  }
}