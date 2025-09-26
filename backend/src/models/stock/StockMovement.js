const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

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
    type: DataTypes.ENUM('entrada', 'saida', 'transferencia', 'ajuste'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notZero(value) {
        if (value === 0) {
          throw new Error('Quantidade não pode ser zero');
        }
      }
    }
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'stock_locations',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  fromLocationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'stock_locations',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  toLocationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'stock_locations',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
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
  validate: {
    transferenceValidation() {
      if (this.type === 'transferencia') {
        if (!this.fromLocationId || !this.toLocationId) {
          throw new Error('Transferência deve ter origem e destino');
        }
        if (this.fromLocationId === this.toLocationId) {
          throw new Error('Origem e destino não podem ser iguais');
        }
      }
    }
  }
});

module.exports = { StockMovement };