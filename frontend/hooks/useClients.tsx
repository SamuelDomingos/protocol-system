"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUrlParams } from "@/hooks/useUrlParams";
import {
  clientsService,
  Client,
  ClientSearchParams,
} from "@/services/clients-api";

export function useClients() {
  const { toast } = useToast();
  const { params, setSearch, setPage, setFilter, setSort } = useUrlParams();

  const [clients, setClients] = useState<Client[]>([]);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | string | null>(
    null
  );
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateClient, setDuplicateClient] = useState<Client | null>(null);
  const [saveClientData, setSaveClientData] = useState<(() => void) | null>(
    null
  );

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const searchParams: ClientSearchParams = {
        search: params.get("search") || undefined,
        page: params.get("page") ? parseInt(params.get("page") as string) : 1,
        limit: itemsPerPage,
        sort: params.get("sort") || undefined,
        status: params.get("status") || undefined,
      };

      const response = await clientsService.listClients(searchParams);
      setClients(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar clientes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [params, itemsPerPage, toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddClient = useCallback(() => {
    setCurrentClient({ name: "", phone: "", cpf: "", observation: "" });
    setIsEditMode(false);
    setIsClientDialogOpen(true);
  }, []);

  const handleEditClient = useCallback((client: Client) => {
    setCurrentClient(client);
    setIsEditMode(true);
    setIsClientDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: number | string) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleSaveClient = useCallback(
    async (clientData?: Partial<Client>) => {
      const dataToSave = clientData || currentClient;

      if (!dataToSave.name?.trim()) {
        toast({
          title: "Erro",
          description: "Nome é obrigatório",
          variant: "destructive",
        });
        return;
      }

      const saveFn = async () => {
        try {
          setIsSubmitting(true);

          if (isEditMode && dataToSave.id) {
            await clientsService.updateClient(dataToSave.id, dataToSave);
            toast({
              title: "Sucesso",
              description: "Cliente atualizado com sucesso",
            });
          } else {
            const clientToCreate = {
              name: dataToSave.name || "",
              observation: dataToSave.observation || "",
              phone: dataToSave.phone || "",
              cpf: dataToSave.cpf || "",
            };
            await clientsService.createClient(clientToCreate);
            toast({
              title: "Sucesso",
              description: "Cliente adicionado com sucesso",
            });
          }

          setIsClientDialogOpen(false);
          setDuplicateDialogOpen(false);
          setCurrentClient({});
          setIsEditMode(false);
          await fetchClients();
        } catch (error) {
          console.error("Erro ao salvar cliente:", error);
          toast({
            title: "Erro",
            description: "Não foi possível salvar o cliente",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      };

      if (isEditMode) {
        await saveFn();
        return;
      }

      try {
        const existing = await clientsService.listClients({
          search: dataToSave.name,
        });
        const duplicate = existing.data.find(
          (c) =>
            c.name.toLowerCase().trim() ===
            dataToSave.name?.toLowerCase().trim()
        );

        if (duplicate) {
          setDuplicateClient(duplicate);
          setSaveClientData(() => saveFn);
          setDuplicateDialogOpen(true);
          return;
        }
      } catch (err) {
        console.warn("Erro ao verificar duplicação:", err);
      }

      await saveFn();
    },
    [currentClient, isEditMode, fetchClients, toast]
  );

  const handleDeleteClient = useCallback(async () => {
    if (!clientToDelete) return;

    try {
      setIsSubmitting(true);
      await clientsService.deleteClient(clientToDelete);
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso",
      });
      await fetchClients();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  }, [clientToDelete, fetchClients, toast]);

  const handleConfirmDuplicate = useCallback(() => {
    if (saveClientData) {
      saveClientData();
    }
  }, [saveClientData]);

  return {
    clients,
    currentClient,
    isLoading,
    isSubmitting,
    isEditMode,
    isClientDialogOpen,
    deleteDialogOpen,
    clientToDelete,
    duplicateDialogOpen,
    duplicateClient,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    saveClientData,

    setSearch,
    setPage,
    setFilter,
    setSort,

    handleAddClient,
    handleEditClient,
    handleDeleteClick,
    handleSaveClient,
    handleDeleteClient,
    handleConfirmDuplicate,

    fetchClients,

    setCurrentClient,
  };
}
