import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/src/lib/api/protocols";
import type {
  ProtocolTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from "../types";
import type { PaginatedResponse, PaginationRequestParams } from "@/src/global/pagination/types/pagination";

export class TemplatesService {
  static async getAll(params?: PaginationRequestParams): Promise<PaginatedResponse<ProtocolTemplate>> {
    const templates = await getTemplates(params);
    return templates as unknown as PaginatedResponse<ProtocolTemplate>;
  }

  static async getById(id: string): Promise<ProtocolTemplate> {
    const template = await getTemplateById(id);
    return template as unknown as ProtocolTemplate;
  }

  static async create(
    data: CreateTemplateRequest
  ): Promise<ProtocolTemplate> {
    const template = await createTemplate(data as any);
    return template as unknown as ProtocolTemplate;
  }

  static async update(
    id: string,
    data: UpdateTemplateRequest
  ): Promise<ProtocolTemplate> {
    const template = await updateTemplate(id, data as any);
    return template as unknown as ProtocolTemplate;
  }

  static async delete(id: string): Promise<void> {
    return deleteTemplate(id);
  }
}