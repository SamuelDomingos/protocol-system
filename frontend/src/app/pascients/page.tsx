// PatientsPage.tsx
"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/src/components/ui/dialog";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ClientsTable, ClientForm } from "@/src/templates/clients";
import { useClients } from "@/src/templates/clients/hooks/useClients";
import { PaginationControls } from "@/src/global/pagination";
import { SearchInput } from "@/src/global/search/components/search-input";
import type { Client } from "@/src/templates/clients/types";

export default function PatientsPage() {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  const { clients, searchTerm, setSearchTerm, pagination, isSearchMode, isLoading, error } =
    useClients();

  const resetClientDialog = () => {
    setIsClientDialogOpen(false);
    setEditingClient(undefined);
  };

  const openClientDialog = (client?: Client) => {
    setEditingClient(client);
    setIsClientDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <p className="text-muted-foreground">
          Gerencie seus pacientes e cadastre novos clientes.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cadastro de Clientes</CardTitle>
          <div className="flex gap-2">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar cliente..."
              className="w-[250px]"
            />
            
            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openClientDialog()}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <ClientForm
                  client={editingClient}
                  onSuccess={resetClientDialog}
                  onCancel={resetClientDialog}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <ClientsTable 
            data={clients}
            isLoading={isLoading}
            error={error}
            onEditClient={openClientDialog}
          />
        </CardContent>

        <CardFooter className="border-t pt-6">
          <PaginationControls 
            pagination={pagination}
            showItemsPerPage={true}
            className="w-full"
          />
        </CardFooter>
      </Card>
    </div>
  );
}
