import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Calendar, Upload, User, FileText, Clock } from 'lucide-react';
import { ApplicationFormProps } from '../../types/components';
import { CreateApplicationRequest, UpdateApplicationRequest } from '@/src/lib/api/types/application';

const ApplicationForm: React.FC<ApplicationFormProps> = ({ 
  application, 
  onSubmit, 
  onCancel, 
  loading = false,
  isEditing = false 
}) => {
  const [clientPhoto, setClientPhoto] = useState<File | null>(null);
  const [clientSignature, setClientSignature] = useState<File | null>(null);
  const [nurseSignature, setNurseSignature] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      stageId: application?.stageId || '',
      nurseId: application?.nurseId || '',
      appliedAt: application?.appliedAt ? new Date(application.appliedAt).toISOString().slice(0, 16) : '',
      status: application?.status || 'pending',
    },
  });

  const handleSubmit = (data: any) => {
    const formData = new FormData();
    
    // Adicionar dados básicos
    formData.append('stageId', data.stageId);
    formData.append('nurseId', data.nurseId);
    formData.append('appliedAt', new Date(data.appliedAt).toISOString());
    formData.append('status', data.status);

    // Adicionar arquivos se existirem
    if (clientPhoto) {
      formData.append('clientPhoto', clientPhoto);
    }
    if (clientSignature) {
      formData.append('clientSignature', clientSignature);
    }
    if (nurseSignature) {
      formData.append('nurseSignature', nurseSignature);
    }

    // Criar objeto de dados para submissão
    const submitData: CreateApplicationRequest | UpdateApplicationRequest = {
      stageId: data.stageId,
      nurseId: data.nurseId,
      appliedAt: new Date(data.appliedAt),
      status: data.status,
    };

    onSubmit(submitData);
  };

  const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    switch (field) {
      case 'clientPhoto':
        setClientPhoto(file);
        break;
      case 'clientSignature':
        setClientSignature(file);
        break;
      case 'nurseSignature':
        setNurseSignature(file);
        break;
    }
  };

  const getFileDisplayName = (file: File | null, existingUrl?: string) => {
    if (file) return file.name;
    if (existingUrl) return 'Arquivo existente';
    return 'Nenhum arquivo selecionado';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {isEditing ? 'Editar Aplicação' : 'Nova Aplicação'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stageId"
                rules={{ required: 'Estágio é obrigatório' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Estágio do Protocolo
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um estágio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stage-1">Estágio 1 - Avaliação Inicial</SelectItem>
                        <SelectItem value="stage-2">Estágio 2 - Procedimento</SelectItem>
                        <SelectItem value="stage-3">Estágio 3 - Acompanhamento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nurseId"
                rules={{ required: 'Enfermeiro é obrigatório' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Enfermeiro Responsável
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um enfermeiro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nurse-1">Maria Silva - Enfermeira</SelectItem>
                        <SelectItem value="nurse-2">João Santos - Enfermeiro</SelectItem>
                        <SelectItem value="nurse-3">Ana Costa - Enfermeira Chefe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appliedAt"
                rules={{ required: 'Data de aplicação é obrigatória' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Data e Hora da Aplicação
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        max={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="applied">Aplicado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de Upload de Arquivos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Documentos e Assinaturas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Foto do Cliente</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('clientPhoto', e)}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    {getFileDisplayName(clientPhoto, application?.clientPhoto)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assinatura do Cliente</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('clientSignature', e)}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    {getFileDisplayName(clientSignature, application?.clientSignature)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assinatura do Enfermeiro</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('nurseSignature', e)}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    {getFileDisplayName(nurseSignature, application?.nurseSignature)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : isEditing ? 'Atualizar Aplicação' : 'Criar Aplicação'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ApplicationForm;