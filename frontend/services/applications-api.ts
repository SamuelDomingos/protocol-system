import { fetchWithAuth } from "./api-utils"

// Interface para aplicação
export interface Application {
  id?: number | string
  stageId: number | string
  nurseId?: number | string
  appliedAt: string
  status?: string
  clientPhoto?: File | string
  clientSignature: string
  nurseSignature: string
  nurse?: {
    id: number | string
    name: string
    role: string
  }
  Stage?: {
    id: number | string
    name: string
    protocolId: number | string
  }
}

// Serviço de API para aplicações
export const applicationsService = {
  // Criar uma nova aplicação (com upload de arquivo)
  createApplication: async (applicationData: FormData): Promise<Application> => {
    return fetchWithAuth("/api/applications", {
      method: "POST",
      body: applicationData,
      headers: {
        // Não definir Content-Type aqui, pois o fetch vai definir automaticamente com o boundary correto para multipart/form-data
      },
    })
  },

  // Atualizar uma aplicação existente
  updateApplication: async (
    id: number | string,
    applicationData: Partial<Omit<Application, "id" | "nurseId" | "clientPhoto">>,
  ): Promise<Application> => {
    return fetchWithAuth(`/api/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(applicationData),
    })
  },

  // Excluir uma aplicação
  deleteApplication: async (id: number | string): Promise<void> => {
    return fetchWithAuth(`/api/applications/${id}`, {
      method: "DELETE",
    })
  },

  // Listar aplicações de um estágio
  listStageApplications: async (stageId: number | string): Promise<Application[]> => {
    return fetchWithAuth(`/api/applications/stage/${stageId}`)
  },

  // Concluir uma aplicação
  completeApplication: async (id: number | string): Promise<void> => {
    return fetchWithAuth(`/api/applications/${id}/force-complete`, {
      method: "POST",
    })
  },
}
