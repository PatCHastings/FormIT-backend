const sequelize = require('../db');
const WizardStep = require('./WizardStep');
const Category = require('./Category');
const Question = require('./Question');
const User = require('./User');
const Request = require('./Request');
const Answer = require('./Answer');
const Token = require('./Token');

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
