"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("proposals", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "requests", // Assumes your 'requests' table is named exactly "requests"
          key: "id",
        },
        onDelete: "CASCADE",
      },
      proposal_content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "draft", // e.g. "draft", "submitted", "approved"
      },
      last_generated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // Sequelize will manage createdAt / updatedAt automatically if you have "timestamps: true" in your model
      // but if you want custom snake-case columns, define them here:
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("proposals");
  },
};