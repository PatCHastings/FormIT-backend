const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING(255),
  },
  fullName: {
    type: DataTypes.STRING(150),
    field: 'full_name',
  },
  role: {
    type: DataTypes.STRING(50), // e.g., "admin", "client"
  },
}, {
  tableName: 'users',
});


module.exports = User;
