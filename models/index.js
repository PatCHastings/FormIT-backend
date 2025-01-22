const sequelize = require('../db');
const WizardStep = require('./WizardStep');
const Category = require('./Category');
const Question = require('./Question');
const User = require('./User');
const Request = require('./Request');
const Answer = require('./Answer');
const Token = require('./Token');

// Initialize Associations with Aliases
WizardStep.hasMany(Category, { foreignKey: 'step_id', as: 'categories' });
Category.belongsTo(WizardStep, { foreignKey: 'step_id', as: 'wizardStep' });

Category.hasMany(Question, { foreignKey: 'category_id', as: 'questions' });
Question.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Export models for use in the app
module.exports = {
  sequelize,
  WizardStep,
  Category,
  Question,
  User,
  Request,
  Answer,
  Token,
};
