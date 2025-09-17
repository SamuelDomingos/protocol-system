import { fetchWithAuth } from "./api-utils"

// Serviço de autenticação
export const authService = {
  // Login
  async login(username: string, password: string) {
    try {
      
      const response = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ name: username, password }),
      })
      
    
      if (!response.token) {
        console.error("Token não encontrado na resposta:", response)
        throw new Error('Token não encontrado na resposta do servidor')
      }
      
      return response
    } catch (error) {
      console.error("Erro no serviço de login:", error)
      throw error
    }
  },

  async verifyToken() {
    return fetchWithAuth('/api/auth/verify')
  },

  // Criar novo usuário
  signup: async (userData: { name: string; password: string; role: string }) => {
    const response = await fetchWithAuth("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Retorna os dados do usuário criado
    return {
      id: response.id,
      name: userData.name,
      role: userData.role
    };
  },

  listUsers: async () => {
    return fetchWithAuth("/api/auth")
  },

  // Obter um usuário específico
  getUser: async (id: string) => {
    return fetchWithAuth(`/api/auth/${id}`)
  },

  // Editar usuário (admin apenas)
  updateUser: async (id: string, userData: { name?: string; role?: string; password?: string }) => {
    return fetchWithAuth(`/api/auth/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  },

  // Deletar usuário (admin apenas)
  deleteUser: async (id: string) => {
    return fetchWithAuth(`/api/auth/${id}`, {
      method: "DELETE",
    })
  },

  // Gerenciamento de permissões
  listPermissions: async (userId: string) => {
    return fetchWithAuth(`/api/permissions/${userId}`)
  },

  updatePermissions: async (userId: string, permissions: {
    module: string;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    allowedPages: string[];
  }[]) => {
    return fetchWithAuth(`/api/permissions/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    })
  },

  removePermission: async (userId: string, module: string) => {
    return fetchWithAuth(`/api/permissions/${userId}/${module}`, {
      method: "DELETE",
    })
  },

  async getUserPermissions(userId: string) {
    try {
      const response = await fetchWithAuth(`/api/permissions/${userId}`)
      if (!response || !response.permissions) {
        throw new Error('Resposta inválida do servidor')
      }
      return response
    } catch (error) {
      console.error("Erro ao buscar permissões:", error)
      throw error
    }
  }
}
