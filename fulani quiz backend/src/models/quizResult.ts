import { DataTypes, Sequelize, Model, Optional, ModelStatic } from 'sequelize';

export interface QuizResultAttributes {
  id: number;
  answers: object; // JSON payload
  recommendation: object | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  state?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type QuizResultCreationAttributes = Optional<
  QuizResultAttributes,
  'id' | 'recommendation' | 'name' | 'email' | 'phone' | 'state' | 'createdAt' | 'updatedAt'
>;


export type QuizResultModel = Model<QuizResultAttributes, QuizResultCreationAttributes> & QuizResultAttributes;

export default function QuizResultFactory(sequelize: Sequelize): ModelStatic<Model<QuizResultAttributes, QuizResultCreationAttributes>> {
  const QuizResult = sequelize.define<Model<QuizResultAttributes, QuizResultCreationAttributes>>(
    'QuizResult',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      answers: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      recommendation: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'quiz_results',
      timestamps: true,
    }
  );

  return QuizResult;
}
