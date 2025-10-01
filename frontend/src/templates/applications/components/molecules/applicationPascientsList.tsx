import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User,
  FileText,
  Eye
} from 'lucide-react';
import { ApplicationPatientsListProps } from '../../types/components';
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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const ApplicationPascientsList: React.FC<ApplicationPatientsListProps> = ({
  applications,
  onSelectApplication,
  selectedApplicationId,
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
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Nenhum paciente com aplicações encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar aplicações por paciente (assumindo que existe um campo client ou similar)
  const groupedByPatient = applications.reduce((acc, application) => {
    // Como não temos dados do paciente na interface Application, vamos simular
    const patientKey = `patient-${application.id.slice(0, 8)}`;
    const patientName = `Paciente ${application.id.slice(0, 8)}`;
    
    if (!acc[patientKey]) {
      acc[patientKey] = {
        id: patientKey,
        name: patientName,
        applications: [],
      };
    }
    
    acc[patientKey].applications.push(application);
    return acc;
  }, {} as Record<string, { id: string; name: string; applications: typeof applications }>);

  const patients = Object.values(groupedByPatient);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Pacientes com Aplicações ({patients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.map((patient) => (
            <Card key={patient.id} className="border-l-4 border-l-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" alt={patient.name} />
                      <AvatarFallback className="bg-primary/10">
                        {getInitials(patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {patient.applications.length} aplicação(ões)
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {patient.applications.length}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {patient.applications.map((application) => (
                    <div
                      key={application.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                        selectedApplicationId === application.id 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'bg-background'
                      }`}
                      onClick={() => onSelectApplication?.(application)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {application.stage?.protocol?.title || 'Protocolo não informado'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Estágio: {application.stage?.name || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>Enfermeiro: {application.nurse?.name || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Aplicado em: {formatDateTime(application.appliedAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(application.status)}
                          {onSelectApplication && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectApplication(application);
                              }}
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {application.completedAt && (
                        <div className="mt-2 pt-2 border-t border-muted">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>Concluído em: {formatDateTime(application.completedAt)}</span>
                            {application.completedBy && (
                              <span>por {application.completedBy}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationPascientsList;