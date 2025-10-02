const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Product = require('./Product');
const Kit = require('./Kit');

const KitProduct = sequelize.define('KitProduct', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  kitId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'kits',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  }
}, {
  tableName: 'kit_products',
  timestamps: false,
  indexes: [
    { fields: ['kitId'] },
    { fields: ['productId'] }
  ]
});

// Associações (a serem registradas no index de models)
Kit.belongsToMany(Product, { through: KitProduct, foreignKey: 'kitId', as: 'products' });
Product.belongsToMany(Kit, { through: KitProduct, foreignKey: 'productId', as: 'kits' });

module.exports = KitProduct;
