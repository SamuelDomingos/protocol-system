const axios = require('axios');
const { resetDB, closeDB } = require('./src/models');

// Configuração base
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Cores para output no console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

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

// Função para fazer requisições com autenticação
async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
}

// Dados de teste
const testData = {
  product: {
    name: 'Produto Teste',
    description: 'Descrição do produto teste',
    sku: 'TEST-001-' + Date.now(),
    barcode: '1234567890123-' + Date.now(),
    category: 'Categoria Teste',
    brand: 'Marca Teste',
    unitPrice: 99.99,
    minimumStock: 10,
    status: 'active',
    unit: 'unidade',
    supplier: 'Fornecedor Teste',
    specifications: {}
  },
  stockLocation: {
    productId: null, // Será atualizado após criar produto
    quantity: 100,
    location: 'Estoque Principal',
    price: 99.99,
    sku: 'TEST-001-LOC-' + Date.now() // Adicionando timestamp para evitar duplicação
  },
  stockMovement: {
    productId: null, // Será atualizado após criar produto
    type: 'entrada',
    quantity: 50,
    locationId: null, // Será atualizado após criar localização
    userId: null, // Será atualizado após login
    reason: 'Entrada inicial',
    notes: 'Teste de movimentação',
    unitPrice: 99.99,
    totalValue: 4999.50
  }
};

// Testes para Products
async function testProducts() {
  console.log(`\n${colors.bold}${colors.blue}📦 TESTANDO ENDPOINTS DE PRODUTOS${colors.reset}`);
  
  const tests = [
    { method: 'POST', url: '/products', data: testData.product, name: 'Criar produto' },
    { method: 'GET', url: '/products', name: 'Listar produtos' },
    { method: 'GET', url: '/products/categories', name: 'Listar categorias' },
    { method: 'GET', url: '/products/brands', name: 'Listar marcas' },
    { method: 'GET', url: '/products/low-stock', name: 'Produtos com estoque baixo' },
    { method: 'GET', url: '/products/sku/{sku}', name: 'Buscar por SKU' },
    { method: 'GET', url: '/products/barcode/{barcode}', name: 'Buscar por código de barras' },
    { method: 'GET', url: '/products/{id}', name: 'Buscar produto por ID' },
    { method: 'PUT', url: '/products/{id}', data: { ...testData.product, name: 'Produto Atualizado' }, name: 'Atualizar produto' },
    { method: 'PATCH', url: '/products/{id}/toggle-active', name: 'Ativar/desativar produto' }
  ];
  
  let createdProductId = null;
  
  for (const test of tests) {
    let currentUrl = test.url;
    let currentData = test.data;
    
    // Substituir placeholders na URL
    if (createdProductId) {
      currentUrl = currentUrl.replace('{id}', createdProductId);
    }
    
    if (testData.product.sku) {
      currentUrl = currentUrl.replace('{sku}', testData.product.sku);
    }
    
    if (testData.product.barcode) {
      currentUrl = currentUrl.replace('{barcode}', testData.product.barcode);
    }
    
    // Pular testes que precisam de ID se não tivermos um ID ainda
    if (currentUrl.includes('{id}') && !createdProductId) {
      console.log(`${colors.yellow}⚠️ Pulando ${test.name}: ID do produto não disponível${colors.reset}`);
      continue;
    }
    
    const result = await makeRequest(test.method, currentUrl, currentData);
    
    if (result.success) {
      console.log(`${colors.green}✅ ${test.name}: ${result.status}${colors.reset}`);
      
      // Captura o ID do produto criado
      if (test.method === 'POST' && test.url === '/products' && result.data.id) {
        createdProductId = result.data.id;
        testData.stockLocation.productId = createdProductId;
        testData.stockMovement.productId = createdProductId;
        console.log(`${colors.blue}ℹ️ ID do produto criado: ${createdProductId}${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ ${test.name}: ${result.status} - ${result.error}${colors.reset}`);
    }
  }
  
  return createdProductId;
}

// Testes para Stock Locations
async function testStockLocations() {
  console.log(`\n${colors.bold}${colors.blue}📍 TESTANDO ENDPOINTS DE LOCALIZAÇÕES DE ESTOQUE${colors.reset}`);
  
  // Verificar se temos o ID do produto antes de prosseguir
  if (!testData.stockLocation.productId) {
    console.log(`${colors.red}❌ Não foi possível testar localizações: ID do produto não disponível${colors.reset}`);
    return null;
  }
  
  console.log(`${colors.blue}ℹ️ Usando productId para localização: ${testData.stockLocation.productId}${colors.reset}`);
  
  const tests = [
    { method: 'POST', url: '/stock-locations', data: testData.stockLocation, name: 'Criar localização' },
    { method: 'GET', url: '/stock-locations', name: 'Listar localizações' },
    { method: 'GET', url: '/stock-locations/{id}', name: 'Buscar por ID' },
    { method: 'PUT', url: '/stock-locations/{id}', data: { ...testData.stockLocation, quantity: 150 }, name: 'Atualizar localização' }
  ];
  
  let createdLocationId = null;
  
  for (const test of tests) {
    let currentUrl = test.url;
    let currentData = test.data;
    
    // Substituir placeholders na URL
    if (createdLocationId) {
      currentUrl = currentUrl.replace('{id}', createdLocationId);
    }
    
    // Pular testes que precisam de ID se não tivermos um ID ainda
    if (currentUrl.includes('{id}') && !createdLocationId) {
      console.log(`${colors.yellow}⚠️ Pulando ${test.name}: ID da localização não disponível${colors.reset}`);
      continue;
    }
    
    // Garantir que os dados atualizados também tenham os IDs corretos
    if (test.method === 'PUT' && createdLocationId) {
      currentData = { 
        ...currentData,
        id: createdLocationId,
        productId: testData.stockLocation.productId // Garantir que o productId está correto
      };
    }
    
    const result = await makeRequest(test.method, currentUrl, currentData);
    
    if (result.success) {
      console.log(`${colors.green}✅ ${test.name}: ${result.status}${colors.reset}`);
      
      // Captura o ID da localização criada
      if (test.method === 'POST' && test.url === '/stock-locations' && result.data.id) {
        createdLocationId = result.data.id;
        testData.stockMovement.locationId = createdLocationId;
        console.log(`${colors.blue}ℹ️ ID da localização criada: ${createdLocationId}${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ ${test.name}: ${result.status} - ${result.error}${colors.reset}`);
    }
  }
  
  return createdLocationId;
}

// Testes para Stock Movements
async function testStockMovements() {
  console.log(`\n${colors.bold}${colors.blue}📊 TESTANDO ENDPOINTS DE MOVIMENTAÇÕES DE ESTOQUE${colors.reset}`);
  
  // Verificar se temos os IDs necessários antes de prosseguir
  if (!testData.stockMovement.productId || !testData.stockMovement.locationId) {
    console.log(`${colors.red}❌ Não foi possível testar movimentações: IDs de produto ou localização não disponíveis${colors.reset}`);
    return null;
  }
  
  console.log(`${colors.blue}ℹ️ Usando productId: ${testData.stockMovement.productId}${colors.reset}`);
  console.log(`${colors.blue}ℹ️ Usando locationId: ${testData.stockMovement.locationId}${colors.reset}`);
  
  const tests = [
    { method: 'POST', url: '/stock-movements', data: testData.stockMovement, name: 'Criar movimentação' },
    { method: 'GET', url: '/stock-movements', name: 'Listar movimentações' },
    { method: 'GET', url: '/stock-movements/{id}', name: 'Buscar por ID' },
    { method: 'PUT', url: '/stock-movements/{id}', data: { ...testData.stockMovement, quantity: 75 }, name: 'Atualizar movimentação' }
  ];
  
  let createdMovementId = null;
  
  for (const test of tests) {
    let currentUrl = test.url;
    let currentData = test.data;
    
    // Substituir placeholders na URL
    if (createdMovementId) {
      currentUrl = currentUrl.replace('{id}', createdMovementId);
    }
    
    // Pular testes que precisam de ID se não tivermos um ID ainda
    if (currentUrl.includes('{id}') && !createdMovementId) {
      console.log(`${colors.yellow}⚠️ Pulando ${test.name}: ID da movimentação não disponível${colors.reset}`);
      continue;
    }
    
    // Garantir que os dados atualizados também tenham os IDs corretos
    if (test.method === 'PUT' && createdMovementId) {
      currentData = { 
        ...currentData,
        id: createdMovementId
      };
    }
    
    const result = await makeRequest(test.method, currentUrl, currentData);
    
    if (result.success) {
      console.log(`${colors.green}✅ ${test.name}: ${result.status}${colors.reset}`);
      if (test.method === 'POST' && test.url === '/stock-movements' && result.data.id) {
        createdMovementId = result.data.id;
        testData.stockMovement.id = createdMovementId;
        console.log(`${colors.blue}ℹ️ ID da movimentação criada: ${createdMovementId}${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ ${test.name}: ${result.status} - ${result.error}${colors.reset}`);
    }
  }
}

// Função principal
async function runTests() {
  console.log(`${colors.bold}${colors.yellow}🚀 INICIANDO TESTES AUTOMATIZADOS DOS ENDPOINTS DE ESTOQUE${colors.reset}\n`);

  // Resetar o banco de dados antes de iniciar os testes
  console.log(`${colors.blue}🔄 Resetando o banco de dados...${colors.reset}`);
  await resetDB();
  console.log(`${colors.green}✅ Banco de dados resetado com sucesso!${colors.reset}`);
  
  // Fazer login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log(`${colors.red}❌ Não foi possível fazer login. Encerrando testes.${colors.reset}`);
    return;
  }
  
  try {
    // Executar testes
    const productId = await testProducts();
    if (productId) {
      testData.stockLocation.productId = productId;
      testData.stockMovement.productId = productId;
    }

    const locationId = await testStockLocations();
    if (locationId) {
      testData.stockMovement.locationId = locationId;
    }
    
    await testStockMovements();
    
    console.log(`\n${colors.bold}${colors.green}🎉 TESTES CONCLUÍDOS!${colors.reset}`);
    console.log(`${colors.yellow}📝 Resumo:${colors.reset}`);
    console.log(`   - Produto criado com ID: ${productId || 'N/A'}`);
    console.log(`   - Localização criada com ID: ${locationId || 'N/A'}`);
    console.log(`   - Todos os endpoints foram testados`);
    
  } catch (error) {
    console.log(`${colors.red}❌ Erro durante os testes: ${error.message}${colors.reset}`);
  } finally {
    await closeDB();
  }
}

// Executar testes
runTests().catch(console.error);