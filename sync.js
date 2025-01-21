const { sequelize } = require('./models');

(async () => {
  try {
    // Sync all models
    await sequelize.sync({ alter: true }); // Use 'alter' for safe schema updates
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
})();
