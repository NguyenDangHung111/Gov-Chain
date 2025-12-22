import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface TransactionAttributes {
  id: number;
  userId: number;
  time: Date;
  citizenId: string; // Redundant as per request, but kept for history
  description: string;
  ipfsHash: string;
  txHash?: string; // Blockchain transaction hash
  caseId?: string; // Blockchain case ID
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'time'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public userId!: number;
  public time!: Date;
  public citizenId!: string;
  public description!: string;
  public ipfsHash!: string;
  public txHash?: string;
  public caseId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    citizenId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipfsHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    txHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caseId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
  }
);

// Define association
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Transaction;
