const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Request = require("./Request");

const Comparison = sequelize.define(
  "Comparison",
  {
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "request_id",
      references: {
        model: "requests", // Make sure this matches your requests table name exactly
        key: "id"
      },
      onDelete: "CASCADE"
    },
    // Time estimates (in weeks or another unit)
    timelineIndustryTime: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "timeline_industry_time"
    },
    timelineFormitTime: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "timeline_formit_time"
    },
    // Cost estimates (in USD, for example)
    budgetIndustryCost: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "budget_industry_cost"
    },
    budgetFormitCost: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "budget_formit_cost"
    }
  },
  {
    tableName: "comparisons",
    timestamps: true // This will automatically create created_at and updated_at columns (if using underscored: true in config, or defined via field)
  }
);

module.exports = Comparison;