import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Edit, Trash2} from 'lucide-react';
import { SupplierTableProps } from '../types';

export const SuppliersTable: React.FC<SupplierTableProps> = ({
  suppliers,
  loading,
  onEdit,
  onDelete,
}) => {
  const getTypeLabel = (type: string) => {
    return type === 'supplier' ? 'Fornecedor' : 'Unidade';
  };

  const getTypeBadgeVariant = (type: string) => {
    return type === 'supplier' ? 'default' : 'secondary';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!suppliers.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum fornecedor encontrado
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>
                <Badge variant={getTypeBadgeVariant(supplier.type)}>
                  {getTypeLabel(supplier.type)}
                </Badge>
              </TableCell>
              <TableCell>{supplier.category}</TableCell>
              <TableCell className="max-w-xs truncate">
                {supplier.notes || '-'}
              </TableCell>
              <TableCell>
                {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('pt-BR') : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(supplier)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};