import { ProtocolsService } from '../molecules/protocols.service';
import type { 
  Protocol, 
  ProtocolStage, 
  CreateProtocolRequest,
  UpdateProtocolRequest 
} from '@/src/templates/protocols/types';
import { toast } from '@/src/hooks/use-toast';

export type ProtocolStageFormData = Omit<ProtocolStage, 'id' | 'protocolId' | 'createdAt' | 'updatedAt'>;

export class ProtocolFormService {
  static async loadProtocol(protocolId: string): Promise<Protocol | null> {
    try {
      const protocol = await ProtocolsService.getById(protocolId);
      
      return protocol;
      
    } catch (error) {
      console.error('Erro ao carregar protocolo:', error);
      return null;
    }
  }

  static async saveProtocol(
    protocolData: CreateProtocolRequest,
    protocolId?: string,
  ): Promise<Protocol | null> {
    try {
      const requestData = protocolData;

      if (protocolId) {
        const updatedProtocol = await ProtocolsService.update(protocolId, requestData as UpdateProtocolRequest);
        return updatedProtocol;
      } else {
        const newProtocol = await ProtocolsService.create(requestData);
        return newProtocol;
      }
    } catch (error) {
      console.error('Erro ao salvar protocolo:', error);
      toast({
        title: "Erro",
        description: error instanceof Error 
          ? `Erro ao salvar protocolo: ${error.message}`
          : "Não foi possível salvar o protocolo",
        variant: "destructive"
      });
      return null;
    }
  }
}