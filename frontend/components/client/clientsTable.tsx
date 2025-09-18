"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/data-table";
import { Loader2, Edit, Trash, Phone, BookMinus } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { usePermissions } from "@/hooks/use-permissions";
import { formatPhoneNumber, formatCPF } from "@/lib/utils";

export function ClientsTable() {
  const {
    clients,
    isLoading,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    handleEditClient,
    handleDeleteClick,
    setPage,
  } = useClients();

  const { getModulePermissions } = usePermissions();
  const { canUpdate, canDelete } = getModulePermissions("clients");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const clientsArray = clients || [];

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Observação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientsArray.length > 0 ? (
            clientsArray.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {formatPhoneNumber(client.phone || "")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <BookMinus className="h-4 w-4 text-muted-foreground" />
                    {formatCPF(client.cpf)}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {client.observation || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteClick(client.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Nenhum cliente cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {clientsArray.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </>
  );
}