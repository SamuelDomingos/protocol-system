import { User, CreateUserRequest, UpdateUserRequest } from '@/src/lib/api/types/user';

export interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  isLoading: boolean;
}

export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}