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

// Interface para parâmetros de busca
export interface ClientSearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  status?: string
}

// Serviço de API para clientes
export const clientsService = {
  // Listar todos os clientes com suporte a paginação e filtros
  listClients: async (params?: ClientSearchParams): Promise<{data: Client[], total: number, page: number, totalPages: number}> => {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `/api/clients${queryString ? `?${queryString}` : ''}`;
    
    return fetchWithAuth(url);
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
}
