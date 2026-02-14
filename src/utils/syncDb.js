require('dotenv').config();
const sequelize = require('../config/database');
require('../models');

async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    await sequelize.sync({ force: true });
    console.log('Database synced (force).');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1);
  }
}

syncDb();
