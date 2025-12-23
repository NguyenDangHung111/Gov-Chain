import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface StatusLogAttributes {
  id: number;
  caseId: string;
  status: number;
  officerId: number;
  note: string;
  txHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StatusLogCreationAttributes extends Optional<StatusLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class StatusLog extends Model<StatusLogAttributes, StatusLogCreationAttributes> implements StatusLogAttributes {
  public id!: number;
  public caseId!: string;
  public status!: number;
  public officerId!: number;
  public note!: string;
  public txHash?: string;

  public readonly officer?: User; // Association

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StatusLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    caseId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    officerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    txHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'status_logs',
  }
);

// Define association
User.hasMany(StatusLog, { foreignKey: 'officerId', as: 'statusLogs' });
StatusLog.belongsTo(User, { foreignKey: 'officerId', as: 'officer' });

export default StatusLog;
