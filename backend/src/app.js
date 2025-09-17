require('dotenv').config();
const express = require('express');
const {initDB } = require('./models'); // já inclui o sequelize aqui
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const os = require('os');

const authRoutes = require('./routes/authRoutes.route');
const clientsRoutes = require('./routes/clients.route');
const protocolsRoutes = require('./routes/protocols.route');
const applicationsRoutes = require('./routes/applications.route');
const permissionsRoutes = require('./routes/permission.route');
const messagesRoutes = require('./routes/messages.route');

const app = express();
app.use(express.json());
app.use(cors());

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

// Inicializa banco e sincroniza modelos
initDB()
  .then(() => console.log('✅ DB connected and models synced'))
  .catch(err => console.error('❌ DB init failed:', err));

// Rotas
app.get('/', (req, res) => {
  res.send('Treatment Protocol System API 🧪');
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/protocols', protocolsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/messages', messagesRoutes);

// Inicia servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  const localIp = getLocalIp();
  console.log(`🚀 HTTP server running on http://${localIp}:${PORT}`);
});