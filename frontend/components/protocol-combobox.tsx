"use client"

import * as React from "react"
import { Check, ChevronsUpDown, BookTemplate } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ProtocolOption {
  id: string | number
  title: string
  clientName?: string
}

interface ProtocolComboboxProps {
  protocols: ProtocolOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ProtocolCombobox({ protocols, value, onChange, disabled = false }: ProtocolComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Encontrar o protocolo selecionado para exibir seu título
  const selectedProtocol = React.useMemo(() => {
    return protocols.find((protocol) => protocol.title === value)
  }, [protocols, value])

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
          {selectedProtocol ? (
            <div className="flex items-center gap-2 truncate">
              <BookTemplate className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">{selectedProtocol.title}</span>
            </div>
          ) : value ? (
            <div className="flex items-center gap-2 truncate">
              <span className="truncate">{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Selecione um protocolo modelo</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar protocolo modelo..." />
          <CommandList>
            <CommandEmpty>Nenhum protocolo modelo encontrado.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {protocols.map((protocol) => (
                <CommandItem
                  key={protocol.id}
                  value={protocol.title}
                  onSelect={() => {
                    onChange(protocol.title)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Check className={cn("mr-2 h-4 w-4", protocol.title === value ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col w-full overflow-hidden">
                      <span className="truncate">{protocol.title}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


// -- Detox Hepático
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Detox Hepático (Endovenoso ou Intramuscular)', 0.00, null, 1, 69, NOW(), NOW());

// -- SLIM INFINITY
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Injetável 1 (Soro)', 0.00, null, 1, 70, NOW(), NOW()),
//   ('Injetável 2 (Soro)', 0.00, null, 2, 70, NOW(), NOW()),
//   ('Injetável 3 (Soro)', 0.00, null, 3, 70, NOW(), NOW()),
//   ('Injetável 4 (Soro)', 0.00, null, 4, 70, NOW(), NOW()),
//   ('Kit Detox', 0.00, null, 5, 70, NOW(), NOW());

// -- SLIM FAST
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Injetável 1 (Soro)', 0.00, null, 1, 71, NOW(), NOW()),
//   ('Injetável 2 (Soro)', 0.00, null, 2, 71, NOW(), NOW());

// -- BLACK NOVO
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Detox Hepático', 0.00, null, 1, 72, NOW(), NOW()),
//   ('Pool Aminoácidos - IM 1', 0.00, null, 2, 72, NOW(), NOW()),
//   ('Pool Aminoácidos - IM 2', 0.00, null, 3, 72, NOW(), NOW()),
//   ('Morosil IM 1', 0.00, null, 4, 72, NOW(), NOW()),
//   ('Morosil IM 2', 0.00, null, 5, 72, NOW(), NOW());

// -- Femini Power + Semaglutida
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Detox Hepático', 0.00, null, 1, 73, NOW(), NOW()),
//   ('Ampola Semaglutida', 0.00, null, 2, 73, NOW(), NOW());

// -- Femini Power + Medicamentos externos
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Detox Hepático', 0.00, null, 1, 74, NOW(), NOW());

// -- Femini Power + Mounjaro
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Detox Hepático', 0.00, null, 1, 75, NOW(), NOW()),
//   ('Mounjaro - Aplicação 1 (60mg)', 0.00, null, 2, 75, NOW(), NOW()),
//   ('Mounjaro - Aplicação 2', 0.00, null, 3, 75, NOW(), NOW()),
//   ('Mounjaro - Aplicação 3', 0.00, null, 4, 75, NOW(), NOW()),
//   ('Mounjaro - Aplicação 4', 0.00, null, 5, 75, NOW(), NOW()),
//   ('Mounjaro - Aplicação 5', 0.00, null, 6, 75, NOW(), NOW()),
//   ('Mounjaro - Aplicação 6', 0.00, null, 7, 75, NOW(), NOW()),
//   ('Mounjaro - Aplicação 7', 0.00, null, 8, 75, NOW(), NOW());

// -- Protocolo Mounjaro Dra Catarina
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Mounjaro - Dose 1', 0.00, null, 1, 76, NOW(), NOW()),
//   ('Mounjaro - Dose 2', 0.00, null, 2, 76, NOW(), NOW()),
//   ('Mounjaro - Dose 3', 0.00, null, 3, 76, NOW(), NOW()),
//   ('Mounjaro - Dose 4', 0.00, null, 4, 76, NOW(), NOW()),
//   ('Mounjaro - Dose 5', 0.00, null, 5, 76, NOW(), NOW()),
//   ('Mounjaro - Dose 6', 0.00, null, 6, 76, NOW(), NOW()),
//   ('Mounjaro - Dose 7', 0.00, null, 7, 76, NOW(), NOW()),
//   ('Mounjaro - Dose 8', 0.00, null, 8, 76, NOW(), NOW()),
//   ('Pool Aminoácidos 1', 0.00, null, 9, 76, NOW(), NOW()),
//   ('Pool Aminoácidos 2', 0.00, null, 10, 76, NOW(), NOW());

// -- Slim Melissa - 4 Doses Escalonadas
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Mounjaro - 0.25', 0.00, null, 1, 77, NOW(), NOW()),
//   ('Mounjaro - 0.30', 0.00, null, 2, 77, NOW(), NOW()),
//   ('Mounjaro - 0.35', 0.00, null, 3, 77, NOW(), NOW()),
//   ('Mounjaro - 0.40', 0.00, null, 4, 77, NOW(), NOW());

// -- Slim Melissa - 8 Doses Escalonadas
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Mounjaro - 0.25 (1)', 0.00, null, 1, 78, NOW(), NOW()),
//   ('Mounjaro - 0.25 (2)', 0.00, null, 2, 78, NOW(), NOW()),
//   ('Mounjaro - 0.30 (1)', 0.00, null, 3, 78, NOW(), NOW()),
//   ('Mounjaro - 0.30 (2)', 0.00, null, 4, 78, NOW(), NOW()),
//   ('Mounjaro - 0.35 (1)', 0.00, null, 5, 78, NOW(), NOW()),
//   ('Mounjaro - 0.35 (2)', 0.00, null, 6, 78, NOW(), NOW()),
//   ('Mounjaro - 0.40', 0.00, null, 7, 78, NOW(), NOW()),
//   ('Mounjaro - 0.45', 0.00, null, 8, 78, NOW(), NOW());

// -- Slim Melissa - 4 Doses Altas
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Mounjaro - 0.40', 0.00, null, 1, 79, NOW(), NOW()),
//   ('Mounjaro - 0.45 (1)', 0.00, null, 2, 79, NOW(), NOW()),
//   ('Mounjaro - 0.45 (2)', 0.00, null, 3, 79, NOW(), NOW()),
//   ('Mounjaro - 0.50', 0.00, null, 4, 79, NOW(), NOW());

// -- Slim Melissa - 8 Doses Altas
// INSERT INTO treatment_db.stages (name, value, intervalDays, `order`, protocolId, createdAt, updatedAt)
// VALUES 
//   ('Mounjaro - 0.40', 0.00, null, 1, 80, NOW(), NOW()),
//   ('Mounjaro - 0.45 (1)', 0.00, null, 2, 80, NOW(), NOW()),
//   ('Mounjaro - 0.45 (2)', 0.00, null, 3, 80, NOW(), NOW()),
//   ('Mounjaro - 0.50 (1)', 0.00, null, 4, 80, NOW(), NOW()),
//   ('Mounjaro - 0.50 (2)', 0.00, null, 5, 80, NOW(), NOW()),
//   ('Mounjaro - 0.50 (3)', 0.00, null, 6, 80, NOW(), NOW()),
//   ('Mounjaro - 0.50 (4)', 0.00, null, 7, 80, NOW(), NOW()),
//   ('Mounjaro - 0.50 (5)', 0.00, null, 8, 80, NOW(), NOW());
