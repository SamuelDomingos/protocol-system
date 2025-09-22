"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { useDebounce } from "@/src/hooks/use-debounce"
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/src/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import type { Client } from "@/services/clients-api"
import { clientsService } from "@/services/clients-api"

interface ClientComboboxProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ClientCombobox({ value, onChange, disabled = false }: ClientComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [clients, setClients] = React.useState<Client[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  // Carregar clientes quando o popover abrir ou quando a busca mudar
  React.useEffect(() => {
    const fetchClients = async () => {
      if (!open) return
      
      try {
        setIsLoading(true)
        setError(null)
        const data = await clientsService.searchClients(debouncedSearch)
        console.log("Dados recebidos:", data); // Log para debug
        setClients(data)
      } catch (error) {
        console.error("Erro ao buscar clientes:", error)
        setError("Erro ao carregar clientes")
        setClients([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [open, debouncedSearch])

  // Encontrar o cliente selecionado para exibir seu nome
  const selectedClient = React.useMemo(() => {
    return clients.find((client) => String(client.id) === value)
  }, [clients, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedClient ? (
            <div className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">{selectedClient.name}</span>
              {selectedClient.cpf && (
                <span className="text-xs text-muted-foreground font-mono truncate">{selectedClient.cpf}</span>
              )}
            </div>
          ) : (
            "Selecione um cliente"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar cliente..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-destructive">
                {error}
              </div>
            ) : (
              <>
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={`${client.name}${client.cpf ? ` ${client.cpf}` : ""}`}
                      onSelect={() => {
                        onChange(String(client.id))
                        setOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Check className={cn("mr-2 h-4 w-4", String(client.id) === value ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col w-full overflow-hidden">
                          <span className="truncate">{client.name}</span>
                          {client.cpf && (
                            <span className="text-xs text-muted-foreground font-mono truncate">CPF: {client.cpf}</span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
