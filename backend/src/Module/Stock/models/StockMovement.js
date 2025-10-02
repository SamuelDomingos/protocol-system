const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const StockMovement = sequelize.define('StockMovement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM('entrada', 'saida', 'transferencia'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fromLocationId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  fromLocationType: {
    type: DataTypes.ENUM('supplier', 'user', 'client'),
    allowNull: true,
  },
  toLocationId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  toLocationType: {
    type: DataTypes.ENUM('supplier', 'user', 'client'),
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  totalValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'stock_movements',
  timestamps: true,
});

module.exports = { StockMovement };