const swaggerJSDoc = require('swagger-jsdoc');

const os = require('os');
const path = require('path');

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

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Treatment Protocol System API',
    version: '1.0.0',
    description: 'Documentação oficial da API do sistema de protocolos de tratamento',
  },
  servers: [
    {
      url: `http://${localIp}:${PORT}/api`,
      description: 'Servidor local de desenvolvimento',
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{
    bearerAuth: []
  }]
};


const options = {
    swaggerDefinition,
    apis: [
      path.join(__dirname, '../routes/*.route.js'), // 👈 nome correto dos arquivos
      path.join(__dirname, '../models/*.js')
    ]
  };

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
