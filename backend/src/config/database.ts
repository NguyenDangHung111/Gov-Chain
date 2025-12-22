import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Set to console.log to see SQL queries
});

export default sequelize;
