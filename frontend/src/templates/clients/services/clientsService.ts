import { getClients, searchClients, createClient, updateClient } from "@/src/lib/api";
import type {
  Client,
  ClientSearchParams,
  ClientsPaginatedResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from "../types";

export class ClientsService {
  static async fetchClients(
    params?: ClientSearchParams
  ): Promise<ClientsPaginatedResponse> {
    try {
      const data = await getClients(params);
      return data;
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      throw new Error(
        error instanceof Error ? error.message : "Erro ao carregar clientes"
      );
    }
  }

  static async searchClients(searchTerm: string): Promise<Client[]> {
    try {
      if (!searchTerm.trim()) {
        throw new Error("Termo de busca não pode estar vazio");
      }

      const data = await searchClients(searchTerm);
      return data;
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw new Error(
        error instanceof Error ? error.message : "Erro ao buscar clientes"
      );
    }
  }

  static validatePaginationParams(
    params?: ClientSearchParams
  ): ClientSearchParams | undefined {
    if (!params) return undefined;

    const validatedParams: ClientSearchParams = {};

    if (params.page && params.page > 0) {
      validatedParams.page = params.page;
    }

    if (params.limit && params.limit > 0) {
      validatedParams.limit = params.limit;
    }

    if (params.search && params.search.trim()) {
      validatedParams.search = params.search.trim();
    }

    return Object.keys(validatedParams).length > 0
      ? validatedParams
      : undefined;
  }

  static buildSearchParamsFromUrl(
    urlParams: URLSearchParams
  ): ClientSearchParams {
    const params: ClientSearchParams = {};

    const page = urlParams.get("page");
    const search = urlParams.get("search");
    const limit = urlParams.get("limit");

    if (page) {
      const pageNum = parseInt(page);
      if (!isNaN(pageNum) && pageNum > 0) {
        params.page = pageNum;
      }
    }

    if (search && search.trim()) {
      params.search = search.trim();
    }

    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        params.limit = limitNum;
      }
    }

    return params;
  }

  static shouldUseSearch(searchTerm: string): boolean {
    return searchTerm.trim().length > 0;
  }

  static async createClient(data: CreateClientRequest): Promise<Client> {
    try {
      const newClient = await createClient(data);
      return newClient;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw new Error(
        error instanceof Error ? error.message : "Erro ao criar cliente"
      );
    }
  }

  static async updateClient(id: number, data: UpdateClientRequest): Promise<Client> {
    try {
      const updatedClient = await updateClient(id, data);
      return updatedClient;
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw new Error(
        error instanceof Error ? error.message : "Erro ao atualizar cliente"
      );
    }
  }

  static formatPaginationInfo(
    pagination: ClientsPaginatedResponse["pagination"]
  ): string {
    const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return `Mostrando ${startItem}-${endItem} de ${totalItems} clientes`;
  }
}
