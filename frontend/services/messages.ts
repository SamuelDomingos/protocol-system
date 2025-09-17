import { fetchWithAuth } from "./api-utils"

// Interface para mensagens
export interface Message {
  id?: number | string
  senderId?: number | string
  receiverId: number | string
  subject: string
  message: string
  isRead?: boolean
  createdAt?: string
  updatedAt?: string
  sender?: {
    id: number | string
    name: string
    role: string
  }
}

// Serviço de API para mensagens
export const messagesService = {
  sendMessage: async (
    receiverId: number | string,
    subject: string,
    message: string
  ): Promise<Message> => {
    return fetchWithAuth("/api/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, subject, message }),
    });
  },

  getInbox: async (): Promise<Message[]> => {
    return fetchWithAuth("/api/messages/inbox");
  },

  markAsRead: async (messageId: string | number): Promise<void> => {
    await fetchWithAuth(`/api/messages/${messageId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead: true })
    });
  }

};