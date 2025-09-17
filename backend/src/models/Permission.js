const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nome do módulo (ex: clients, protocols, etc)'
  },
  canCreate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  canRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  allowedPages: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array de páginas que o usuário tem permissão para acessar'
  },
  canUpdate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  canDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'module']
    }
  ]
});

module.exports = Permission; 