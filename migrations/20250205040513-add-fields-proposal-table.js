"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add multiple columns to "proposals" table
    await queryInterface.addColumn("proposals", "project_overview", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("proposals", "project_scope", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("proposals", "timeline", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("proposals", "budget", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("proposals", "terms_and_conditions", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("proposals", "next_steps", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("proposals", "deliverables", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("proposals", "compliance_requirements", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("proposals", "admin_notes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the added columns if we ever revert this migration
    await queryInterface.removeColumn("proposals", "project_overview");
    await queryInterface.removeColumn("proposals", "project_scope");
    await queryInterface.removeColumn("proposals", "timeline");
    await queryInterface.removeColumn("proposals", "budget");
    await queryInterface.removeColumn("proposals", "terms_and_conditions");
    await queryInterface.removeColumn("proposals", "next_steps");
    await queryInterface.removeColumn("proposals", "deliverables");
    await queryInterface.removeColumn("proposals", "compliance_requirements");
    await queryInterface.removeColumn("proposals", "admin_notes");
  },
};
