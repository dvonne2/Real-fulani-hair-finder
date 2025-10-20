import app from './app.js';
import dotenv from 'dotenv';
import { sequelize } from './config/database.js';

dotenv.config();

const PORT = Number(process.env.PORT || 8000);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

start();
