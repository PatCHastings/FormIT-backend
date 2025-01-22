'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      question_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'text', // Default question type
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // Optional by default
      },
      help_text: {
        type: Sequelize.TEXT,
        allowNull: true, // Optional field for guidance
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: true, // For ordering questions
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'categories', // Matches the table name
          key: 'id',
        },
        onDelete: 'CASCADE', // Cascade delete if a category is deleted
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('questions');
  },
};
