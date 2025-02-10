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
      field: "expires_at",
    },
  },
  {
    tableName: 'tokens', // Explicitly specify the table name
    timestamps: false, // Disable the default timestamps
  }
);

module.exports = Token;
