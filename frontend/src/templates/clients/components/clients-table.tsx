"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { DataTableWrapper } from "@/src/components/ui/data-table-wrapper";
import { useClients } from "../hooks/useClients";
import type { Client } from "@/src/lib/api/types";
import { formatPhoneNumber, formatCPF } from "@/src/lib/utils";

interface ClientsTableProps {
  onEditClient?: (client: Client) => void;
  onViewClient?: (client: Client) => void;
  onDeleteClient?: (client: Client) => void;
}

export function ClientsTable({
  onEditClient,
  onViewClient,
  onDeleteClient,
}: ClientsTableProps) {
  const { clients, isLoading, error } = useClients();

  return (
    <DataTableWrapper
      isLoading={isLoading}
      error={error}
      data={clients}
      loadingMessage="Carregando clientes..."
      emptyMessage="Nenhum cliente encontrado"
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{formatPhoneNumber(client.phone)}</TableCell>
                <TableCell>{formatCPF(client.cpf)}</TableCell>
                <TableCell>
                  {client.observation ? (
                    <span className="text-sm text-muted-foreground">
                      {client.observation.length > 50
                        ? `${client.observation.substring(0, 50)}...`
                        : client.observation}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onViewClient && (
                        <DropdownMenuItem onClick={() => onViewClient(client)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                      )}
                      {onEditClient && (
                        <DropdownMenuItem onClick={() => onEditClient(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onDeleteClient && (
                        <DropdownMenuItem
                          onClick={() => onDeleteClient(client)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DataTableWrapper>
  );
}