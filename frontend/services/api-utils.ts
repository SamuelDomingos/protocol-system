// Função para obter a URL base da API
export const getApiBaseUrl = () => {
  // Verificar se estamos no navegador
  if (typeof window !== "undefined") {
    // Quando no navegador, usamos a URL atual para determinar o host
    const { protocol, hostname } = window.location
    return `${protocol}//${hostname}:5000`
  } else {
    // Quando no servidor (SSR), podemos usar a lógica original com os.networkInterfaces()
    try {
      const os = require('os')
      
      const getLocalIp = () => {
        const interfaces = os.networkInterfaces()
        for (const iface of Object.values(interfaces)) {
          for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
              return config.address
            }
          }
        }
        return 'localhost' // Fallback
      }
      
      return `http://${getLocalIp()}:5000`
    } catch (error) {
      // Fallback se não conseguir determinar o IP
      return 'http://localhost:5000'
    }
  }
}

// Definir API_BASE_URL usando a função
export const API_BASE_URL = getApiBaseUrl()

// Função para verificar se o token está expirado
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Converter para milissegundos
    return Date.now() >= expirationTime
  } catch (error) {
    console.error('Erro ao verificar expiração do token:', error)
    return true // Se houver erro ao decodificar, considera como expirado
  }
}

// Função para testar token expirado
export const testTokenExpiration = () => {
  const token = getToken()
  if (!token) {
    return
  }
}

export const getToken = () => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("sistema_protocolo_user")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.token && !isTokenExpired(user.token)) {
          return user.token
        }
        // Se o token estiver expirado, limpa o localStorage
        localStorage.removeItem("sistema_protocolo_user")
        return null
      } catch (e) {
        console.error('Erro ao parsear dados do usuário:', e)
        return null
      }
    }
  }
  return null
}

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // Não verificar token para rotas públicas
  const isPublicRoute = endpoint === '/api/auth/login'
  const token = isPublicRoute ? null : getToken()
  const isFormData = options.body instanceof FormData
  
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })
    
    // Se for rota de login, não tratamos 401 como sessão expirada
    if (response.status === 401 && !isPublicRoute) {
      localStorage.removeItem("sistema_protocolo_user")
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      
      throw new Error('Sessão expirada. Por favor, faça login novamente.')
    }
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na requisição (${endpoint}):`, errorText)
      
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        // Se não for JSON, usa o texto como está
      }
      
      throw new Error((errorData as any).message || `Erro na requisição: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Erro ao fazer requisição para ${endpoint}:`, error)
    throw error
  }
}