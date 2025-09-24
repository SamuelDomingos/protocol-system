"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { ClientForm } from "./components/client-form";
import { ClientsTable } from "./components/clients-table";
import type { Client } from "@/src/lib/api/types";

export function ClientsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateClient = () => {
    setEditingClient(undefined);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingClient(undefined);
    // Força a atualização da tabela
    setRefreshKey(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(undefined);
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <ClientForm
          client={editingClient}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes do sistema
          </p>
        </div>
        <Button onClick={handleCreateClient}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <ClientsTable
        key={refreshKey}
        onEditClient={handleEditClient}
        onViewClient={(client) => {
          // Implementar visualização de cliente se necessário
          console.log("Visualizar cliente:", client);
        }}
        onDeleteClient={(client) => {
          // Implementar exclusão de cliente se necessário
          console.log("Excluir cliente:", client);
        }}
      />
    </div>
  );
}
