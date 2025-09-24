import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';
import type { Protocol } from '../types';

interface ProtocolsTableProps {
  data: Protocol[];
  isLoading: boolean;
  error: string | null;
  onEdit: (protocol: Protocol) => void;
  onDelete: (id: string) => void;
}

export function ProtocolsTable({ data, isLoading, error, onEdit, onDelete }: ProtocolsTableProps) {
  if (isLoading) return <div className="text-center py-4">Carregando...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!data.length) return <div className="text-center py-4">Nenhum protocolo encontrado</div>;
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Etapas</TableHead>
          <TableHead>Valor Total</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((protocol) => (
          <TableRow key={protocol.id}>
            <TableCell className="font-medium">{protocol.title}</TableCell>
            <TableCell>{protocol.clientName}</TableCell>
            <TableCell>
            </TableCell>
            <TableCell>{protocol.stage}</TableCell>
            <TableCell>{formatCurrency(protocol.totalValue)}</TableCell>
            <TableCell>{new Date(protocol.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(protocol)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(protocol.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
