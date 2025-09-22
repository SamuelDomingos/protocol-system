const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TIPOS_ENTRADA = [
  'compra_nota_fiscal',
  'devolucao_avulsa_paciente',
  'devolucao_avulsa_setor',
  'pedido_compra'
];

const TIPOS_SAIDA = [
  'consumo_funcionario',
  'consumo_paciente',
  'consumo_setor',
  'devolucao_emprestimo',
  'doacao',
  'emprestimo',
  'perda_dano',
  'vencido',
  'saida_kit'
];

const TIPO_TRANSFER = 'transfer';
const CATEGORIAS = ['entrada', 'saida', 'transfer'];

const LABELS_ENTRADA = {
  'compra_nota_fiscal': 'Compra (Nota Fiscal)',
  'devolucao_avulsa_paciente': 'Devolução Avulsa - Paciente',
  'devolucao_avulsa_setor': 'Devolução Avulsa - Setor',
  'pedido_compra': 'Pedido de Compra'
};

const LABELS_SAIDA = {
  'consumo_funcionario': 'Consumo do Funcionário',
  'consumo_paciente': 'Consumo do Paciente',
  'consumo_setor': 'Consumo do Setor',
  'devolucao_emprestimo': 'Devolução do Empréstimo',
  'doacao': 'Doação',
  'emprestimo': 'Empréstimo',
  'perda_dano': 'Perda/Dano',
  'vencido': 'Vencido',
  'saida_kit': 'Saída de Kit'
};

const StockMovement = sequelize.define(
  'StockMovement',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // IDs de relacionamento - CORRIGIDOS
    productId: {
      type: DataTypes.STRING, // Mudado para STRING (sem referência)
      allowNull: false
    },
    supplierId: {
      type: DataTypes.STRING, // Mudado para STRING (sem referência)
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    
    // Campos de negócio
    type: {
      type: DataTypes.ENUM(...TIPOS_ENTRADA, ...TIPOS_SAIDA, TIPO_TRANSFER),
      allowNull: false
    },
    movementCategory: {
      type: DataTypes.ENUM(...CATEGORIAS),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    observation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: true
    },
    movementDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    
    // Campos de localização com referências corretas
    locationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Primary location for simple movements (entries/exits)',
      references: {
        model: 'stock_locations',
        key: 'id'
      }
    },
    fromLocationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Origin location (transfers only)',
      references: {
        model: 'stock_locations',
        key: 'id'
      }
    },
    toLocationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Destination location (transfers only)',
      references: {
        model: 'stock_locations',
        key: 'id'
      }
    },
    
    // Campos financeiros
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    
    // Campos de lote/validade
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'stock_movements',
    timestamps: true,
    paranoid: true, // Soft delete
    indexes: [
      { fields: ['productId'] },
      { fields: ['userId'] },
      { fields: ['supplierId'] },
      { fields: ['type'] },
      { fields: ['movementCategory'] },
      { fields: ['movementDate'] },
      { fields: ['locationId'] },
      { fields: ['fromLocationId', 'toLocationId'] },
      { fields: ['batchNumber'] },
      { fields: ['expiryDate'] }
    ],
    validate: {
      destinationRequiredForEntries() {
        if (TIPOS_ENTRADA.includes(this.type) && !this.destination) {
          throw new Error('Destination is required for entry movements');
        }
      },
      consistentCategory() {
        if (TIPOS_ENTRADA.includes(this.type) && this.movementCategory !== 'entrada') {
          throw new Error('Category must be "entrada" for entry types');
        }
        if (TIPOS_SAIDA.includes(this.type) && this.movementCategory !== 'saida') {
          throw new Error('Category must be "saida" for exit types');
        }
        if (this.type === TIPO_TRANSFER && this.movementCategory !== 'transfer') {
          throw new Error('Category must be "transfer" for transfer movements');
        }
      },
      positiveQuantity() {
        if (this.quantity <= 0) {
          throw new Error('Quantity must be greater than zero');
        }
      },
      consistentExpiry() {
        if (this.expiryDate && this.expiryDate <= this.movementDate) {
          throw new Error('Expiry date must be after movement date');
        }
      },
      consistentLocation() {
        if (this.type === TIPO_TRANSFER) {
          if (!this.fromLocationId || !this.toLocationId) {
            throw new Error('Transfers require both origin and destination locations');
          }
          if (this.fromLocationId === this.toLocationId) {
            throw new Error('Origin location must be different from destination in transfers');
          }
          if (this.locationId) {
            throw new Error('For transfers, use only fromLocationId and toLocationId');
          }
        } else {
          if (this.fromLocationId || this.toLocationId) {
            throw new Error('fromLocationId and toLocationId are exclusive to transfers');
          }
        }
      },
      consistentCosts() {
        if (this.unitCost && this.unitCost < 0) {
          throw new Error('Unit cost cannot be negative');
        }
        if (this.totalCost && this.totalCost < 0) {
          throw new Error('Total cost cannot be negative');
        }
      }
    }
  }
);

// Hooks
StockMovement.beforeSave((movement) => {
  if (movement.unitCost && movement.quantity) {
    movement.totalCost = (movement.unitCost * movement.quantity).toFixed(2);
  }
  
  if (movement.observation) {
    movement.observation = movement.observation.trim();
  }
});

// Métodos estáticos
StockMovement.getTiposEntrada = () =>
  TIPOS_ENTRADA.map((t) => ({ 
    value: t, 
    label: LABELS_ENTRADA[t] 
  }));

StockMovement.getTiposSaida = () =>
  TIPOS_SAIDA.map((t) => ({ 
    value: t, 
    label: LABELS_SAIDA[t] 
  }));

StockMovement.getAllTypes = () => [
  ...StockMovement.getTiposEntrada(),
  ...StockMovement.getTiposSaida(),
  { value: TIPO_TRANSFER, label: 'Transferência' }
];

// Escopos
StockMovement.addScope('entradas', { where: { movementCategory: 'entrada' } });
StockMovement.addScope('saidas', { where: { movementCategory: 'saida' } });
StockMovement.addScope('transferencias', { where: { movementCategory: 'transfer' } });
StockMovement.addScope('recentes', { order: [['movementDate', 'DESC']] });
StockMovement.addScope('porProduto', (productId) => ({ where: { productId } }));
StockMovement.addScope('porPeriodo', (startDate, endDate) => ({
  where: {
    movementDate: {
      [sequelize.Op.between]: [startDate, endDate]
    }
  }
}));
StockMovement.addScope('proximosVencimento', (dias = 30) => ({
  where: {
    expiryDate: {
      [sequelize.Op.between]: [new Date(), new Date(Date.now() + dias * 24 * 60 * 60 * 1000)]
    }
  }
}));

// Associações CORRIGIDAS - removendo referências a modelos inexistentes
StockMovement.associate = (models) => {
  // Apenas associações com modelos que existem
  StockMovement.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  StockMovement.belongsTo(models.StockLocation, { foreignKey: 'fromLocationId', as: 'fromLocation' });
  StockMovement.belongsTo(models.StockLocation, { foreignKey: 'toLocationId', as: 'toLocation' });
  StockMovement.belongsTo(models.StockLocation, { foreignKey: 'locationId', as: 'location' });
};

module.exports = {
  StockMovement,
  TIPOS_ENTRADA,
  TIPOS_SAIDA,
  TIPO_TRANSFER,
  CATEGORIAS,
  LABELS_ENTRADA,
  LABELS_SAIDA
};