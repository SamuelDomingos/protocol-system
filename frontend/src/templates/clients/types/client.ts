// Tipos principais do módulo de clientes
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
  page?: number;
  limit?: number;
  search?: string;
}

export interface ClientsPaginatedResponse {
  clients: Client[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
