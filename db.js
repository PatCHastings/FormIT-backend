require('dotenv').config(); // Load .env variables

const { Sequelize } = require('sequelize');

// Destructure environment variables
const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DB_HOST,
  DB_DIALECT,
} = process.env;

// Create a new Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: console.log, // Set to false to disable SQL logging
  define: {
    underscored: true, // Enforce snake_case for table and column names globally
    timestamps: true, // Default timestamps for all tables
  },
});

module.exports = sequelize;
