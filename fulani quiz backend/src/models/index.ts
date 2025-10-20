import { Sequelize, type Model, type ModelStatic } from 'sequelize';
import { sequelize } from '../config/database.js';
import QuizResultFactory, { type QuizResultAttributes, type QuizResultCreationAttributes } from './quizResult.js';

export const QuizResult = QuizResultFactory(sequelize) as ModelStatic<
  Model<QuizResultAttributes, QuizResultCreationAttributes>
>;

export type DB = {
  sequelize: Sequelize;
  QuizResult: typeof QuizResult;
};

export const db: DB = {
  sequelize,
  QuizResult,
};

export default db;
