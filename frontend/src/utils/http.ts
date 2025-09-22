import type { ApiMethod } from '../lib/api/types';
import { API_CONFIG } from '../lib/config/api';

interface RequestOptions {
  method?: ApiMethod;
  body?: any;
  requiresAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}: ${response.statusText}`;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        // Captura a mensagem que o backend enviou
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
    } catch {
      // Se não conseguir parsear, usa a mensagem padrão
    }
    
    throw new ApiError(errorMessage, response.status, response);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return response.text() as unknown as T;
};

const buildUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = 'GET', body, requiresAuth = true } = options;

  const headers: Record<string, string> = {
    ...API_CONFIG.DEFAULT_HEADERS,
  };

  if (requiresAuth) {
    Object.assign(headers, getAuthHeaders());
  }

  try {
    const url = buildUrl(endpoint);
    
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`Erro na requisição ${method} ${endpoint}:`, error);
    throw new Error('Erro de conexão com o servidor');
  }
};

export { ApiError };