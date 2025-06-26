import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'superadmin' | 'admin' | 'staff' | 'teacher' | 'student';
    username: string;
    profile?: string;
    fatherName?: string;
    motherName?: string;
    phone?: string;
    emergencyContact?: string;
    permanentAddress?: string;
    temporaryAddress?: string;
    dob?: Date;
    dateofjoin?: Date;
    dateofleave?: Date;
    remark?: string;
    isActive: boolean;

}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public username!: string;

    public role!: 'superadmin' | 'admin' | 'staff' | 'teacher' | 'student';
    public profile?: string;
    public fatherName?: string;
    public motherName?: string;
    public phone?: string;
    public emergencyContact?: string;
    public permanentAddress?: string;
    public temporaryAddress?: string;
    public dob?: Date;
    public dateofjoin?: Date;
    public dateofleave?: Date;
    public remark?: string;
    public isActive!: boolean;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('superadmin', 'admin', 'staff', 'teacher', 'student'),
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        profile: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        fatherName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        motherName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        emergencyContact: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        permanentAddress: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        temporaryAddress: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        dob: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        dateofjoin: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        dateofleave: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        remark: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'tbl_users',
        timestamps: false,
    }
);

export default User;