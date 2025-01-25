const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Request = sequelize.define('Request', {
  projectName: {
    type: DataTypes.STRING(255),
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'draft', // e.g., "draft", "submitted"
  },
}, {
  tableName: 'requests',
});

// Associations
Request.belongsTo(User, { foreignKey: 'user_id', onDelete: 'SET NULL' });
User.hasMany(Request, { foreignKey: 'user_id' });

module.exports = Request;
