const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

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
