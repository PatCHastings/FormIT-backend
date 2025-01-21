const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Category = require('./Category');

const Question = sequelize.define('Question', {
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  questionType: {
    type: DataTypes.STRING(50), // e.g., "text", "textarea", "select", etc.
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  helpText: {
    type: DataTypes.TEXT,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'questions',
  timestamps: true,
  underscored: true,
});

// Associations
Question.belongsTo(Category, { foreignKey: 'category_id', onDelete: 'CASCADE' });
Category.hasMany(Question, { foreignKey: 'category_id' });

module.exports = Question;
