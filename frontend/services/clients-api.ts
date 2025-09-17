import { fetchWithAuth } from "./api-utils"

// Interface para o cliente
export interface Client {
  id: number | string
  name: string
  phone?: string
  cpf?: string
  observation?: string
  createdAt?: string
  updatedAt?: string
}

// Serviço de API para clientes
export const clientsService = {
  // Listar todos os clientes
  listClients: async (): Promise<Client[]> => {
    return fetchWithAuth("/api/clients")
  },

  // Obter um cliente específico
  getClient: async (id: number | string): Promise<Client> => {
    return fetchWithAuth(`/api/clients/${id}`)
  },

  // Criar um novo cliente
  createClient: async (clientData: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> => {
    return fetchWithAuth("/api/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    })
  },

  // Atualizar um cliente existente
  updateClient: async (
    id: number | string,
    clientData: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Client> => {
    return fetchWithAuth(`/api/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientData),
    })
  },

  // Excluir um cliente
  deleteClient: async (id: number | string): Promise<void> => {
    return fetchWithAuth(`/api/clients/${id}`, {
      method: "DELETE",
    })
  },

  searchClients: async (searchTerm: string): Promise<Client[]> => {
    try {
      const data = await fetchWithAuth(`/api/clients/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!Array.isArray(data)) {
        console.error("Dados recebidos não são um array:", data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }
  },
}
