const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Token = sequelize.define(
  'Token',
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: { 
      type: DataTypes.STRING,
      allowNull: true,
      field: "full_name",
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens', // Explicitly specify the table name
  }
);

module.exports = Token;
