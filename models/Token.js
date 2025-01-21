const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Token = sequelize.define(
  'Token',
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
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
    timestamps: true, // Ensure createdAt and updatedAt fields are handled
  }
);

module.exports = Token;
