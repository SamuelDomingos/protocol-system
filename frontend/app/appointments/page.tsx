"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/hooks/use-permissions";
import { Plus, Search } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { ClientsTable } from "@/components/client/clientsTable";
import { ClientFormDialog } from "@/components/client/clientFormDialog";
import { DeleteClientDialog } from "@/components/client/deleteClientDialog";
import { useState, useCallback } from "react";

export default function AppointmentsPage() {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { getModulePermissions } = usePermissions();

  const { canView, canCreate } = getModulePermissions("clients");

  const { setSearch } = useClients();
  if (!canView) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para visualizar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Atendimentos</h1>
        <p className="text-muted-foreground">
          Gerencie seus atendimentos e cadastre novos clientes.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cadastro de Clientes</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cliente..."
                className="pl-8 w-[250px]"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {canCreate && (
              <Button onClick={() => setIsClientDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ClientsTable />
        </CardContent>
      </Card>

      <ClientFormDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
      />

      <DeleteClientDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
       />
    </div>
  );
}
