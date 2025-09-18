import { Client } from "@/services/clients-api";

export interface ClientsState {
  clients: Client[];
  currentClient: Partial<Client>;
  isLoading: boolean;
  isSubmitting: boolean;
  isEditMode: boolean;
  phoneDisplay: string;
  cpfDisplay: string;
  isClientDialogOpen: boolean;
  deleteDialogOpen: boolean;
  clientToDelete: number | string | null;
  duplicateDialogOpen: boolean;
  duplicateClient: Client | null;
  saveClientData: (() => void) | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}
