const { DataTypes, Op } = require('sequelize');
const sequelize = require('../../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  description: DataTypes.TEXT,
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'unidade',
    allowNull: false,
  },
  category: DataTypes.STRING,
  minimumStock: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    allowNull: false,
    validate: { min: 0 }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
  },
  barcode: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: true,
  },
  supplier: DataTypes.STRING,
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    validate: { min: 0 }
  },
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['sku'],
      where: { sku: { [Op.ne]: null } }
    },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['name'] }
  ]
});

module.exports = Product;