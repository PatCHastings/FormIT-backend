require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const { Sequelize } = require('sequelize');

// Destructure environment variables
const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_DIALECT,
} = process.env;

if (!DB_DIALECT) {
  throw new Error("Database dialect is not defined in environment variables.");
}

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT || 5432,
  dialect: DB_DIALECT,
  logging: console.log, 
  define: {
    underscored: true, // Enforce snake_case for table and column names globally
    timestamps: true, 
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Ignore self-signed certificates in AWS RDS
    },
  },
});

module.exports = sequelize;
