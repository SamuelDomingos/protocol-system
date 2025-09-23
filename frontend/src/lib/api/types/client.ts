export interface Client {
  id: number;
  name: string;
  phone: string;
  cpf: string;
  observation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  phone: string;
  cpf: string;
  observation?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

export interface ClientSearchParams {
  search?: string;
  page?: number;
  limit?: number;
}

// Novo tipo para a resposta paginada baseado na estrutura do servidor
export interface ClientsPaginatedResponse {
  clients: Client[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}