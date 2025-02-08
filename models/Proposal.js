// models/Proposal.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Request = require("./Request");

const Proposal = sequelize.define(
  "Proposal",
  {
    // Existing columns
    proposalContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "proposal_content",
      defaultValue: "Proposal content not yet generated.",
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: "version",
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "draft",
      field: "status",
    },
    lastGeneratedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_generated_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },

    // Newly added columns (snake_case in the DB)
    projectOverview: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "project_overview",
    },
    projectScope: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "project_scope",
    },
    timeline: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "timeline",
    },
    budget: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "budget",
    },
    termsAndConditions: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "terms_and_conditions",
    },
    nextSteps: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "next_steps",
    },
    deliverables: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "deliverables",
    },
    complianceRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "compliance_requirements",
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "admin_notes",
    },
  },
  {
    tableName: "proposals",
    timestamps: true, // uses createdAt/updatedAt
  }
);

// Associations
Proposal.belongsTo(Request, { foreignKey: "request_id", onDelete: "CASCADE" });
Request.hasOne(Proposal, { foreignKey: "request_id" });

module.exports = Proposal;
