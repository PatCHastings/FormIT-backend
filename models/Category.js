const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const WizardStep = require('./WizardStep');

const Category = sequelize.define('Category', {
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
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
});

// Associations
Category.belongsTo(WizardStep, { foreignKey: 'step_id', onDelete: 'CASCADE' });
WizardStep.hasMany(Category, { foreignKey: 'step_id' });

module.exports = Category;
