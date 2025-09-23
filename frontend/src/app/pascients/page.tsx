"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ClientsTable } from "@/src/templates/clients/components/clients-table";
import { useClients } from "@/src/templates/clients/hooks/useClients";
import { PaginationControls } from "@/src/global/pagination";
import { SearchInput } from "@/src/global/search/components/search-input";

export default function PatientsPage() {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const { searchTerm, setSearchTerm, pagination, isSearchMode } = useClients();

  const { getModulePermissions } = usePermissions();
  // const { canView, canCreate } = getModulePermissions("patients");

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
            <Button onClick={() => setIsClientDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ClientsTable />
        </CardContent>
        <CardFooter className="border-t pt-6">
          <PaginationControls 
            pagination={pagination} 
            showItemsPerPage={true}
            className="w-full"
          />
        </CardFooter>
      </Card>

      {/* <ClientFormDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
      /> */}
    </div>
  );
}
