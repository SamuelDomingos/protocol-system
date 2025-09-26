import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/src/lib/api/protocols";
import type {
  Protocol,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from "@/src/templates/protocols/types";
import type { PaginatedResponse, PaginationRequestParams } from "@/src/global/pagination/types/pagination";
import { toast } from "@/src/hooks/use-toast";

export class TemplatesService {
  static async getAll(params?: PaginationRequestParams): Promise<PaginatedResponse<Protocol>> {
    const templates = await getTemplates(params);
    return templates as unknown as PaginatedResponse<Protocol>;
  }

  static async getById(id: string): Promise<Protocol> {
    const template = await getTemplateById(id);
    return template as unknown as Protocol;
  }

  static async create(
    data: CreateTemplateRequest
  ): Promise<Protocol> {
    const template = await createTemplate(data as any);
    toast({
      title: "Template criado com sucesso",
      description: "O template foi criado com sucesso",
      variant: "success",
    });
    return template as unknown as Protocol;
  }

  static async update(
    id: string,
    data: UpdateTemplateRequest
  ): Promise<Protocol> {
    const template = await updateTemplate(id, data as any);
    toast({
      title: "Template atualizado com sucesso",
      description: "O template foi atualizado com sucesso",
      variant: "success",
    });
    return template as unknown as Protocol;
  }

  static async delete(id: string): Promise<void> {
    toast({
      title: "Template deletado com sucesso",
      description: "O template foi deletado com sucesso",
      variant: "success",
    });
    return deleteTemplate(id);
  }
}