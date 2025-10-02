const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  stageId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  nurseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  appliedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  clientPhoto: {
    type: DataTypes.TEXT('long'), 
    allowNull: false
  },
  clientSignature: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  nurseSignature: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'applied'),
    defaultValue: 'applied'
  }
}, {
  tableName: 'applications',
  timestamps: true
});

module.exports = Application;
