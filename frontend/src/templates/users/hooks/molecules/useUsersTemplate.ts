import { useState, useCallback } from 'react';
import { User, CreateUserRequest, UpdateUserRequest } from '@/src/lib/api/types/user';
import { useUsers } from '../atoms/useUsers';

export const useUsersTemplate = () => {
  const { users, isLoading, fetchUsers, fetchUsersById, createUser, updateUser, deleteUser } = useUsers();  
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenCreateDialog = useCallback(() => {
    setSelectedUser(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleSubmit = useCallback(async (data: CreateUserRequest | UpdateUserRequest) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, data as UpdateUserRequest);
      } else {
        await createUser(data as CreateUserRequest);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Erro já tratado no hook useUsers
    }
  }, [selectedUser, createUser, updateUser]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteUser(id);
    } catch (error) {
      // Erro já tratado no hook useUsers
    }
  }, [deleteUser]);

  return {
    users,
    isLoading,
    fetchUsers,
    fetchUsersById,
    selectedUser,
    isDialogOpen,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    refreshUsers: fetchUsers,
  };
};