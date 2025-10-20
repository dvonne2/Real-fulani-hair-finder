// Sequelize CLI configuration (CommonJS)
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'fulani',
    password: process.env.DB_PASSWORD || 'fulani_password',
    database: process.env.DB_NAME || 'fulani_quiz',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_meta'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  }
};
