const sequelize = require('../db'); // Your Sequelize instance
const WizardStep = require('./WizardStep');
const Category = require('./Category');
const Question = require('./Question');
const User = require('./User');
const Request = require('./Request');
const Answer = require('./Answer');
const Token = require('./Token');
const Proposal = require('./Proposal');

// Define associations
WizardStep.hasMany(Category, { foreignKey: 'step_id', as: 'categories' });
Category.belongsTo(WizardStep, { foreignKey: 'step_id', as: 'wizardStep' });

Category.hasMany(Question, { foreignKey: 'category_id', as: 'questions' });
Question.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Request.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Request, { foreignKey: 'user_id', as: 'requests' });

Answer.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });
Request.hasMany(Answer, { foreignKey: 'request_id', as: 'answers' });

Answer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
Question.hasMany(Answer, { foreignKey: 'question_id', as: 'answers' });

// Export models and sequelize instance
module.exports = {
  sequelize, // Export the Sequelize instance
  WizardStep,
  Category,
  Question,
  User,
  Request,
  Answer,
  Token,
  Proposal,
};
