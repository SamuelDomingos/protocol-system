import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Button } from '@/src/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { ProtocolTemplate } from '@/src/templates/protocols/types';
import { formatCurrency } from '@/src/lib/utils';

interface TemplatesTableProps {
  data: ProtocolTemplate[];
  onEdit: (template: ProtocolTemplate) => void;
  onDelete: (id: string) => void;
}

export function TemplatesTable({ data, onEdit, onDelete }: TemplatesTableProps) {
  if (!data || !data.length) return <div className="text-center py-4">Nenhum template encontrado</div>;
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titulo</TableHead>
          <TableHead>Etapas</TableHead>
          <TableHead>Valor Total</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((template) => (
          <TableRow key={template.id}>
            <TableCell className="font-medium">{template.title}</TableCell>
            <TableCell>{template.stage}</TableCell>
            <TableCell>{formatCurrency(template.totalValue)}</TableCell>
            <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(template.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar
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