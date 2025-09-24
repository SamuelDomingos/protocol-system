import {
  getProtocols,
  getProtocolById,
  createProtocol,
  updateProtocol,
  deleteProtocol,
} from "@/src/lib/api/protocols";
import type {
  Protocol,
  CreateProtocolRequest,
  UpdateProtocolRequest,
} from "../types";
import type { PaginatedResponse, PaginationRequestParams } from "@/src/global/pagination/types/pagination";

export class ProtocolsService {
  static async getAll(params?: PaginationRequestParams): Promise<PaginatedResponse<Protocol>> {
    const protocols = await getProtocols(params);
    return protocols as unknown as PaginatedResponse<Protocol>;
  }

  static async getById(id: string): Promise<Protocol> {
    const protocol = await getProtocolById(id);
    return protocol as unknown as Protocol;
  }

  static async create(data: CreateProtocolRequest): Promise<Protocol> {
    const protocol = await createProtocol(data as any);
    return protocol as unknown as Protocol;
  }

  static async update(
    id: string,
    data: UpdateProtocolRequest
  ): Promise<Protocol> {
    const protocol = await updateProtocol(id, data as any);
    return protocol as unknown as Protocol;
  }

  static async delete(id: string): Promise<void> {
    return deleteProtocol(id);
  }

  static calculateTotalValue(protocol: Protocol): number {
    return protocol.stages.reduce((total, stage) => total + stage.value, 0);
  }
}
