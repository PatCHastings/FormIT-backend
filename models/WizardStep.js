const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const WizardStep = sequelize.define('WizardStep', {
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  serviceType: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'wizard_steps',
});

module.exports = WizardStep;