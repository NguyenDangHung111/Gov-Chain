import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  citizenId: string;
  password?: string; // In a real app, this should be hashed
  fullName: string;
  dob: string;
  address: string;
  job: string;
  role: 'citizen' | 'officer';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public citizenId!: string;
  public password!: string;
  public fullName!: string;
  public dob!: string;
  public address!: string;
  public job!: string;
  public role!: 'citizen' | 'officer';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    citizenId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    job: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('citizen', 'officer'),
      allowNull: false,
      defaultValue: 'citizen',
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;
