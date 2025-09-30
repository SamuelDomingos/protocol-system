import { useState, useCallback, useEffect } from 'react';
import { User, CreateUserRequest, UpdateUserRequest } from '@/src/lib/api/types/user';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '@/src/lib/api/users';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleSuccess } = useFeedbackHandler();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const fetchUsersById = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getUserById(id);
      setUsers([data]);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const handleCreateUser = useCallback(async (userData: CreateUserRequest) => {
    setIsLoading(true);
    try {
      const newUser = await createUser(userData);
      setUsers((prev) => [...prev, newUser]);
      handleSuccess('Usuário criado com sucesso');
      return newUser;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleSuccess, handleError]);

  const handleUpdateUser = useCallback(async (id: string, userData: UpdateUserRequest) => {
    setIsLoading(true);
    try {
      const updatedUser = await updateUser(id, userData);
      handleSuccess('Usuário atualizado com sucesso');
      return updatedUser;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleSuccess, handleError]);

  const handleDeleteUser = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      handleSuccess('Usuário excluído com sucesso');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleSuccess, handleError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    fetchUsers,
    fetchUsersById,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
  };
};