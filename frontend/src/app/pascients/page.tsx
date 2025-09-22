"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { ClientsTable } from "@/src/templates/clients/components/clients-table";
import { useClients } from "@/src/templates/clients/hooks/useClients";

export default function PatientsPage() {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const { searchTerm, setSearchTerm } = useClients();

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
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cliente..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsClientDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ClientsTable />
        </CardContent>
      </Card>

      {/* <ClientFormDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
      /> */}
    </div>
  );
}
