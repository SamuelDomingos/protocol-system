// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'doctor', 'closing', 'technique', 'stock'),
        defaultValue: 'doctor',
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['name']
        }
    ]
});

// Relacionamento com permissões
User.associate = (models) => {
    User.hasMany(models.Permission, {
        foreignKey: 'userId',
        as: 'permissions'
    });
};

module.exports = User;
