"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ClientsService } from "../services/clientsService";
import type { 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest,
  ClientFormData,
  UseClientFormProps,
  UseClientFormReturn
} from "../types";

export const useClientForm = ({
  client,
  onSuccess,
  onCancel,
}: UseClientFormProps): UseClientFormReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!client;

  const form = useForm<ClientFormData>({
    defaultValues: {
      name: client?.name || "",
      phone: client?.phone || "",
      cpf: client?.cpf || "",
      observation: client?.observation || "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      let result: Client;

      if (isEditing && client) {
        const updateData: UpdateClientRequest = {
          name: data.name,
          phone: data.phone || undefined,
          cpf: data.cpf || undefined,
          observation: data.observation || undefined,
        };
        result = await ClientsService.updateClient(client.id, updateData);
      } else {
        const createData: CreateClientRequest = {
          name: data.name,
          phone: data.phone || "",
          cpf: data.cpf || "",
          observation: data.observation || "",
        };
        result = await ClientsService.createClient(createData);
      }

      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar cliente";
      setError(errorMessage);
      console.error("Erro ao salvar cliente:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    error,
    onSubmit,
    isEditing,
  };
};
