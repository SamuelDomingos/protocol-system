import { ProtocolsService } from './protocols.service';
import type { 
  Protocol, 
  ProtocolStage, 
  CreateProtocolRequest,
  UpdateProtocolRequest 
} from '../types';
import { toast } from '@/src/hooks/use-toast';

export type ProtocolStageFormData = Omit<ProtocolStage, 'id' | 'protocolId' | 'createdAt' | 'updatedAt'>;

export class ProtocolFormService {
  static async loadProtocol(protocolId: string): Promise<CreateProtocolRequest | null> {
    try {
      const protocol = await ProtocolsService.getById(protocolId);
      
      return {
        title: protocol.title,
        clientId: protocol.clientId,
        stages: protocol.stages
      };
      
    } catch (error) {
      console.error('Erro ao carregar protocolo:', error);
      return null;
    }
  }

  static async saveProtocol(
    protocolData: { title: string; clientId?: string }, 
    stages: ProtocolStageFormData[] = [],
    protocolId?: string,
  ): Promise<Protocol | null> {
    try {

      const requestData: CreateProtocolRequest | UpdateProtocolRequest = {
        title: protocolData.title,
        clientId: protocolData.clientId,
        stages: stages,
      };

      if (protocolId) {
        const updatedProtocol = await ProtocolsService.update(protocolId, requestData);
        return updatedProtocol;
      } else {
        const newProtocol = await ProtocolsService.create(requestData as CreateProtocolRequest);
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