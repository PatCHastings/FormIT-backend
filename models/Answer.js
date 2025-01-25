const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Request = require('./Request');
const Question = require('./Question');

const Answer = sequelize.define('Answer', {
  answer: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'answers',
});

// Associations
Answer.belongsTo(Request, { foreignKey: 'request_id', onDelete: 'CASCADE' });
Request.hasMany(Answer, { foreignKey: 'request_id' });

Answer.belongsTo(Question, { foreignKey: 'question_id', onDelete: 'CASCADE' });
Question.hasMany(Answer, { foreignKey: 'question_id' });

module.exports = Answer;
