const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const WizardStep = require('./WizardStep');
const Question = require('./Question');

const Category = sequelize.define(
  'Category',
  {
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Category;
