require("dotenv").config();
const express = require("express");
const { initDB } = require("./Module/Index");
const cors = require("cors");

// const swaggerUi = require('swagger-ui-express');
// const swaggerSpec = require('./config/swagger');

const os = require("os");
const productsRoutes = require("./Module/Product/products.route");
const stockLocationsRoutes = require("./Module/Stock/routes/stockLocations.route");
const stockMovementsRoutes = require("./Module/Stock/routes/stockMovements.route");

const authRoutes = require("./Module/Auth/authRoutes.route");
const clientsRoutes = require("./Module/Client/clients.route");
const protocolsRoutes = require("./Module/Protocol/protocols.route");
const applicationsRoutes = require("./Module/Application/applications.route");
const permissionsRoutes = require("./Module/Permission/permission.route");
const messagesRoutes = require("./Module/Message/messages.route");
const templatesRoutes = require("./Module/Protocol/templates.route");
const stagesRoutes = require("./Module/Stage/stages.routes");
const suppliersRoutes = require("./Module/Supplier/suppliers.route");
const usersRoutes = require("./Module/User/users.route");
const kitsRoutes = require("./Module/Kit/kit.route");

const { errorHandler, notFoundHandler } = require("./utils/asyncHandler");

const app = express();
app.use(express.json());
app.use(cors());

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }
  return "localhost";
}

const startServer = async () => {
  try {
    await initDB();

    app.get("/", (req, res) => {
      res.send("Treatment Protocol System API 🧪");
    });
    // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use("/api/auth", authRoutes);
    app.use("/api/users", usersRoutes);
    app.use("/api/clients", clientsRoutes);
    app.use("/api/protocols", protocolsRoutes);
    app.use("/api/stages", stagesRoutes);
    app.use("/api/templates", templatesRoutes);
    app.use("/api/applications", applicationsRoutes);
    app.use("/api/permissions", permissionsRoutes);
    app.use("/api/messages", messagesRoutes);
    app.use("/api/products", productsRoutes);
    app.use("/api/kits", kitsRoutes);
    app.use("/api/stock-locations", stockLocationsRoutes);
    app.use("/api/stock-movements", stockMovementsRoutes);
    app.use("/api/suppliers", suppliersRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      const localIp = getLocalIp();
      console.log(`🚀 HTTP server running on http://${localIp}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar servidor:", error);
    process.exit(1);
  }
};

startServer();
