const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Category = require('./Category');

const Question = sequelize.define(
  'Question',
  {
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    questionType: {
      type: DataTypes.STRING(50), // e.g., "text", "textarea", "select", etc.
      allowNull: false,
      defaultValue: "text", // Default question type
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Optional by default
    },
    helpText: {
      type: DataTypes.TEXT, // Additional guidance for answering the question
    },
    sortOrder: {
      type: DataTypes.INTEGER, // Used for ordering questions within a category
    },
  },
  {
    tableName: 'questions',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Question;
