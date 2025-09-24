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
      primaryKey: true,
      allowNull: false
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    supplierId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
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
      allowNull: false
    },
    locationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Primary location for simple movements (entries/exits)'
    },
    fromLocationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Origin location (transfers only)'
    },
    toLocationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Destination location (transfers only)'
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
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
    paranoid: true
  }
);

StockMovement.beforeSave((movement) => {
  if (movement.unitCost && movement.quantity) {
    movement.totalCost = (movement.unitCost * movement.quantity).toFixed(2);
  }
  
  if (movement.observation) {
    movement.observation = movement.observation.trim();
  }
});

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

StockMovement.associate = (models) => {
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