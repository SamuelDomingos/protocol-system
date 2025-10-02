const { DataTypes } = require('sequelize');
<<<<<<<< HEAD:backend/src/Module/Kit/models/Kit.js
const sequelize = require('../../../config/database');
========
const sequelize = require('../../config/database');
>>>>>>>> 662c9195f1552aabe09dd68a6ae35cbb357ea64d:backend/src/Module/Kit/Kit.js

const Kit = sequelize.define('Kit', {
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
  category: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  tableName: 'kits',
  timestamps: true,
  indexes: [
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['name'] }
  ]
});

module.exports = Kit;
