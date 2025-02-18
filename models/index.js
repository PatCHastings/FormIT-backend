const sequelize = require("../db"); // Sequelize instance
const WizardStep = require("./WizardStep");
const Category = require("./Category");
const Question = require("./Question");
const User = require("./User");
const Request = require("./Request");
const Answer = require("./Answer");
const Token = require("./Token");
const Proposal = require("./Proposal");
const Comparison = require("./Comparison");

// ---------------------------
// Define associations
// ---------------------------

// 1) WizardStep <-> Category
WizardStep.hasMany(Category, {
  foreignKey: "step_id",
  as: "categories",
});
Category.belongsTo(WizardStep, {
  foreignKey: "step_id",
  as: "wizardStep",
});

// 2) Category <-> Question
Category.hasMany(Question, {
  foreignKey: "category_id",
  as: "questions",
});
Question.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// 3) User <-> Request
User.hasMany(Request, {
  foreignKey: "user_id",
  as: "requests",
});
Request.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// 4) Request <-> Answer
Request.hasMany(Answer, {
  foreignKey: "request_id",
  as: "answers",
});
Answer.belongsTo(Request, {
  foreignKey: "request_id",
  as: "request",
});

// 5) Question <-> Answer
// NOTE: This should be the only association pair for Answer <-> Question.
Question.hasMany(Answer, {
  foreignKey: "question_id",
  as: "answers", 
});
Answer.belongsTo(Question, {
  foreignKey: "question_id",
  as: "question", 
});

// 6) Request <-> Proposal
// If you want each request to have exactly one proposal:
Request.hasOne(Proposal, {
  foreignKey: "request_id",
  as: "proposal",    // The alias you will use in "include"
  onDelete: "CASCADE",
});
Proposal.belongsTo(Request, {
  foreignKey: "request_id",
  as: "request",
});

// Define association: Each Comparison belongs to a Request.
Comparison.belongsTo(Request, { foreignKey: "request_id", as: "request" });

// ---------------------------
// Export all models + sequelize
// ---------------------------
module.exports = {
  sequelize,
  WizardStep,
  Category,
  Question,
  User,
  Request,
  Answer,
  Token,
  Proposal,
  Comparison,
};
