import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Button } from '@/src/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Edit } from 'lucide-react';
import type { ProtocolTemplate } from '../types';

interface TemplatesTableProps {
  data: ProtocolTemplate[];
  onUseTemplate: (template: ProtocolTemplate) => void;
  onEdit: (template: ProtocolTemplate) => void;
}

export function TemplatesTable({ data, onUseTemplate, onEdit }: TemplatesTableProps) {
  if (!data || !data.length) return <div className="text-center py-4">Nenhum template encontrado</div>;

  console.log('TemplatesTable data', data);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titulo</TableHead>
          <TableHead>Etapas</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((template) => (
          <TableRow key={template.id}>
            <TableCell className="font-medium">{template.title}</TableCell>
            <TableCell>{template.stage}</TableCell>
            <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUseTemplate(template)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Usar Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
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