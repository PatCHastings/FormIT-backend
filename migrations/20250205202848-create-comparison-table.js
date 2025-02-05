"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("comparisons", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "requests",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      timeline_industry_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      timeline_formit_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      budget_industry_cost: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      budget_formit_cost: {
        type: Sequelize.STRING,
        allowNull: true,
      },
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
    await queryInterface.dropTable("comparisons");
  },
};
