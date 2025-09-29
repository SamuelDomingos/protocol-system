const axios = require('axios');
const { resetDB, closeDB } = require('./src/models');

// Configuração base
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Função para fazer login e obter token
async function login() {
  try {
    console.log(`${colors.blue}🔐 Fazendo login...${colors.reset}`);
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: '123456'
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      if (response.data.user && response.data.user.id) {
        testData.stockMovement.userId = response.data.user.id;
      }
      console.log(`${colors.green}✅ Login realizado com sucesso!${colors.reset}`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erro no login: ${error.response?.data?.message || error.message}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Tentando criar usuário admin...${colors.reset}`);
    
    try {
      const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Admin Test',
        email: 'admin@test.com',
        password: '123456',
        role: 'admin'
      });
      
      // Atualizar userId com o ID do usuário criado
      if (signupResponse.data.user && signupResponse.data.user.id) {
        testData.stockMovement.userId = signupResponse.data.user.id;
      }
      
      console.log(`${colors.green}✅ Usuário admin criado!${colors.reset}`);
      return await login(); // Tenta login novamente
    } catch (signupError) {
      console.log(`${colors.red}❌ Erro ao criar usuário: ${signupError.response?.data?.message || signupError.message}${colors.reset}`);
      return false;
    }
  }
}

// Executar testes
runTests().catch(console.error);