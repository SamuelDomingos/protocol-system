const { DataTypes } = require('sequelize');
<<<<<<<< HEAD:backend/src/Module/Kit/models/KitProduct.js
const sequelize = require('../../../config/database');
========
const sequelize = require('../../config/database');
>>>>>>>> 662c9195f1552aabe09dd68a6ae35cbb357ea64d:backend/src/Module/Kit/KitProduct.js

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

module.exports = KitProduct;
