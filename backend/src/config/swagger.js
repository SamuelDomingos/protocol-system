const swaggerJSDoc = require('swagger-jsdoc');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
const PORT = process.env.PORT || 5000;

// Lê o arquivo openapi.yaml principal
const openApiPath = path.join(__dirname, '../../Docs/openapi.yaml');
let swaggerSpec;

try {
  console.log(`Attempting to load OpenAPI spec from: ${openApiPath}`);
  const yamlFile = fs.readFileSync(openApiPath, 'utf8');
  swaggerSpec = YAML.parse(yamlFile);
  console.log('Successfully parsed openapi.yaml');
  
  // Atualiza a URL do servidor dinamicamente
  if (swaggerSpec.servers) {
    swaggerSpec.servers = [
      {
        url: `http://${localIp}:${PORT}/api`,
        description: 'Servidor local de desenvolvimento',
      }
    ];
  }

  
  function resolveLocalRefs(obj, currentPath) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => resolveLocalRefs(item, currentPath));
    }

    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (key === '$ref' && typeof value === 'string' && value.startsWith('./')) {
          const refFilePath = path.resolve(currentPath, value);
          try {
            const refContent = fs.readFileSync(refFilePath, 'utf8');
            const parsedRef = YAML.parse(refContent);
            // Recursivamente resolve referências dentro do arquivo referenciado
            Object.assign(newObj, resolveLocalRefs(parsedRef, path.dirname(refFilePath)));
          } catch (refError) {
            console.error(`❌ Erro ao resolver referência local ${value} em ${currentPath}:`, refError.message);
            newObj[key] = value; // Mantém a referência original em caso de erro
          }
        } else {
          newObj[key] = resolveLocalRefs(value, currentPath);
        }
      }
    }
    return newObj;
  }

  // Resolve as referências para paths e schemas
  const docsBasePath = path.dirname(openApiPath);
  
  // Inicializa paths e components.schemas se não existirem
  swaggerSpec.paths = swaggerSpec.paths || {};
  swaggerSpec.components = swaggerSpec.components || {};
  swaggerSpec.components.schemas = swaggerSpec.components.schemas || {};

  // Resolve as referências dentro de paths
  if (swaggerSpec.paths) {
    const resolvedPaths = resolveLocalRefs(swaggerSpec.paths, path.join(docsBasePath, 'paths'));
    Object.assign(swaggerSpec.paths, resolvedPaths);
  }

  // Resolve as referências dentro de components.schemas
  if (swaggerSpec.components && swaggerSpec.components.schemas) {
    const resolvedSchemas = resolveLocalRefs(swaggerSpec.components.schemas, path.join(docsBasePath, 'schemas'));
    Object.assign(swaggerSpec.components.schemas, resolvedSchemas);
  }

  console.log('✅ Documentação OpenAPI carregada e referências resolvidas com sucesso!');
  console.log(`📚 Endpoints encontrados: ${Object.keys(swaggerSpec.paths || {}).length}`);
  
} catch (error) {
  console.error('❌ Erro fatal ao carregar ou processar openapi.yaml:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Fallback para configuração básica
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Treatment Protocol System API',
      version: '1.0.0',
      description: 'Erro ao carregar documentação. Verifique os logs do servidor.',
    },
    servers: [
      {
        url: `http://${localIp}:${PORT}/api`,
        description: 'Servidor local de desenvolvimento',
      }
    ],
    paths: {
      '/error': {
        get: {
          summary: 'Erro na documentação',
          responses: {
            '500': {
              description: 'Não foi possível carregar a documentação OpenAPI.',
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  };
}

module.exports = swaggerSpec;
