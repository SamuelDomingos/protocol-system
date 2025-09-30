'use client';

import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Plus } from 'lucide-react';
import UsersTable from './components/atoms/UsersTable';
import UserDialog from './components/molecules/UserDialog';
import DeleteConfirmDialog from './components/molecules/DeleteConfirmDialog';
import { useUsersTemplate } from './hooks/molecules/useUsersTemplate';

const UsersTemplate: React.FC = () => {
  const {
    users,
    isLoading,
    selectedUser,
    isDialogOpen,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
  } = useUsersTemplate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await handleDelete(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <UsersTable
        users={users}
        onEdit={handleOpenEditDialog}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      <UserDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
        user={selectedUser}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UsersTemplate;