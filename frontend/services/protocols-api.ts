import { fetchWithAuth } from "./api-utils"

// Interface para estágio do protocolo
export interface ProtocolStage {
  id?: number | string
  name: string
  value: number
  intervalDays: number
  order?: number
  status?: "pending" | "applied"
  date?: string | null
  scheduledDate?: string | null
}

// Interface para cliente
export interface Client {
  id: number | string
  name: string
  cpf: string
}

// Interface para protocolo
export interface Protocol {
  id?: number
  clientId: string | number | null
  title: string
  isTemplate: boolean
  stages: ProtocolStage[]
  createdBy?: number
  createdAt?: string
  updatedAt?: string
  Client?: {
    id: number
    name: string
    cpf?: string
  }
}

// Serviço de API para protocolos
export const protocolsService = {
  // Listar todos os protocolos
  listProtocols: async (): Promise<Protocol[]> => {
    try {
      const data = await fetchWithAuth("/api/protocols");
      if (!Array.isArray(data)) {
        console.error("Dados recebidos não são um array:", data);
        return [];
      }
      
      // Verificar se cada protocolo tem a estrutura esperada
      const validProtocols = data.filter(protocol => {
        const isValid = protocol && 
          typeof protocol === 'object' && 
          'id' in protocol && 
          'title' in protocol && 
          'stages' in protocol && 
          Array.isArray(protocol.stages);
        
        return isValid;
      });
      
      return validProtocols;
    } catch (error) {
      console.error("Erro ao listar protocolos:", error);
      return [];
    }
  },

  // Obter um protocolo específico
  getProtocol: async (id: number | string): Promise<Protocol> => {
    return fetchWithAuth(`/api/protocols/${id}`)
  },

  // Criar um novo protocolo
  createProtocol: async (
    protocolData: Omit<Protocol, "id" | "createdBy" | "createdAt" | "updatedAt">,
  ): Promise<Protocol> => {
    // Garantir que os estágios não tenham IDs para que novos sejam criados
    const sanitizedData = {
      ...protocolData,
      stages: protocolData.stages.map((stage) => ({
        name: stage.name,
        value: stage.value,
        intervalDays: stage.intervalDays,
        // Remover qualquer ID que possa ter vindo do modelo
        // para garantir que novos IDs sejam gerados
      })),
    }

    return fetchWithAuth("/api/protocols", {
      method: "POST",
      body: JSON.stringify(sanitizedData),
    })
  },

  // Atualizar um protocolo existente
  updateProtocol: async (
    id: number | string,
    protocolData: Omit<Protocol, "id" | "createdBy" | "createdAt" | "updatedAt">,
  ): Promise<Protocol> => {
    return fetchWithAuth(`/api/protocols/${id}`, {
      method: "PUT",
      body: JSON.stringify(protocolData),
    })
  },

  // Excluir um protocolo
  deleteProtocol: async (id: number | string): Promise<void> => {
    return fetchWithAuth(`/api/protocols/${id}`, {
      method: "DELETE",
    })
  },
}
