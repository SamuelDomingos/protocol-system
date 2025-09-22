"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Loader2 } from "lucide-react";
// import { useClients } from "@/hooks/useClients";

import { formatPhoneNumber, formatCPF } from "@/src/lib/utils";

export function ClientFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    isEditMode,
    currentClient,

    isSubmitting,
    handleSaveClient,
  } = useClients();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formatPhoneNumber(currentClient.phone || "")}
              onChange={(e) =>
                handleSaveClient({ ...currentClient, name: e.target.value })
              }
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formatPhoneNumber(currentClient?.phone || "")}
              onChange={(e) =>
                handleSaveClient({ ...currentClient, phone: e.target.value })
              }
              placeholder="(99) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={formatCPF(currentClient?.cpf || "")}
              onChange={(e) =>
                handleSaveClient({ ...currentClient, cpf: e.target.value })
              }
              placeholder="999.999.999-99"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observação</Label>
            <Textarea
              id="observation"
              value={currentClient?.observation || ""}
              onChange={(e) =>
                handleSaveClient({
                  ...currentClient,
                  observation: e.target.value,
                })
              }
              placeholder="Informações adicionais sobre o cliente"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={() => handleSaveClient()} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isEditMode ? (
              "Salvar Alterações"
            ) : (
              "Adicionar Cliente"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
