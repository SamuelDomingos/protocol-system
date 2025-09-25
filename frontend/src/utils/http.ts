import type { ApiMethod } from '../lib/api/types';
import { API_CONFIG } from '../lib/config/api';

interface RequestOptions {
  method?: ApiMethod;
  body?: any;
  requiresAuth?: boolean;
  params?: Record<string, any>;
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
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}: ${response.statusText}`;
    let errorDetails = null;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error("Erro detalhado do backend:", errorData);
        
        errorDetails = errorData;
        
        // Captura a mensagem que o backend enviou
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.details) {
          errorMessage = errorData.details;
        }
      } else {
        // Tenta ler como texto se não for JSON
        const errorText = await response.text();
        console.error("Erro como texto:", errorText);
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (parseError) {
      console.error("Erro ao parsear resposta de erro:", parseError);
      // Se não conseguir parsear, usa a mensagem padrão
    }
    
    console.error("Erro HTTP completo:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
      errorMessage,
      errorDetails
    });
    
    throw new ApiError(errorMessage, response.status, response);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return response.text() as unknown as T;
};

const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
  
  if (!params) {
    return baseUrl;
  }
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = 'GET', body, requiresAuth = true, params } = options;

  const headers: Record<string, string> = {
    ...API_CONFIG.DEFAULT_HEADERS,
  };

  if (requiresAuth) {
    Object.assign(headers, getAuthHeaders());
  }

  try {
    const url = buildUrl(endpoint, params);
    
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