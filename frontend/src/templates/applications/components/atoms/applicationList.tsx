import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/src/components/ui/table';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Edit, Trash2, Eye, CheckCircle, Clock, XCircle, User, Calendar } from 'lucide-react';
import { ApplicationListProps } from '../../types/components';
import { formatDateTime } from '@/src/lib/utils';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'applied':
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Aplicado</Badge>;
    case 'completed':
      return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />Concluído</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Cancelado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  onEdit,
  onDelete,
  onView,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Nenhuma aplicação encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Aplicações ({applications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo/Estágio</TableHead>
                <TableHead>Enfermeiro</TableHead>
                <TableHead>Data de Aplicação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Conclusão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {application.stage?.protocol?.title || 'Protocolo não informado'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {application.stage?.name || 'Estágio não informado'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {application.nurse?.name || 'Não informado'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {application.nurse?.role || ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDateTime(application.appliedAt)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(application.status)}
                  </TableCell>
                  <TableCell>
                    {application.completedAt ? formatDateTime(application.completedAt) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(application)}
                          title="Visualizar aplicação"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onEdit && application.status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(application)}
                          title="Editar aplicação"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && application.status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(application.id)}
                          title="Excluir aplicação"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationList;