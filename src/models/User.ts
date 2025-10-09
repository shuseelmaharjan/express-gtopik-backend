import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
    id: number;

    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    password: string;
    username: string;
    role: 'superadmin' | 'admin' | 'staff' | 'teacher' | 'student' | 'accountant' | 'engineer' | 'guardian';

    // Personal information
    dateOfBirth?: Date;
    sex: 'male' | 'female' | 'other';
    profile?: string;
    profilePicture?: string;

    // Guardian / family information
    fatherName?: string;
    motherName?: string;
    grandfatherName?: string;
    grandmotherName?: string;
    guardianName?: string;
    guardianContact?: string;
    fatherNumber?: string;
    motherNumber?: string;
    emergencyContact?: string;

    // Address information (legacy aggregate + new structured)
    country?: string;
    permanentState?: string;
    permanentCity?: string;
    permanentLocalGovernment?: string;
    permanentWardNumber?: string;
    permanentTole?: string;
    permanentPostalCode?: string;
    tempState?: string;
    tempCity?: string;
    tempLocalGovernment?: string;
    tempWardNumber?: string;
    tempTole?: string;
    tempPostalCode?: string;

    // Academic / status info
    status?: 'Graduated' | 'Enrolled' | 'Left' | 'Pending';
    graduatedDate?: Date;
    leaveReason?: string;

    // Legacy employment style fields
    dateofjoin?: Date;
    dateofleave?: Date;
    remark?: string;

    // Active + audit
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
    updatedBy?: number;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public firstName!: string;
    public middleName?: string;
    public lastName!: string;
    public email!: string;
    public password!: string;
    public username!: string;
    public role!: UserAttributes['role'];
    public sex!: UserAttributes['sex'];
    public dateOfBirth?: Date;
    public profile?: string;
    public profilePicture?: string;
    public fatherName?: string;
    public motherName?: string;
    public grandfatherName?: string;
    public grandmotherName?: string;
    public guardianName?: string;
    public guardianContact?: string;
    public fatherNumber?: string;
    public motherNumber?: string;
    public emergencyContact?: string;
    public country?: string;
    public permanentState?: string;
    public permanentCity?: string;
    public permanentLocalGovernment?: string;
    public permanentWardNumber?: string;
    public permanentTole?: string;
    public permanentPostalCode?: string;
    public tempState?: string;
    public tempCity?: string;
    public tempLocalGovernment?: string;
    public tempWardNumber?: string;
    public tempTole?: string;
    public tempPostalCode?: string;
    public status?: UserAttributes['status'];
    public leftDate?: Date;
    public graduatedDate?: Date;
    public leaveReason?: string;
    public dob?: Date;
    public dateofjoin?: Date;
    public dateofleave?: Date;
    public remark?: string;
    public isActive!: boolean;
    public createdAt?: Date;
    public updatedAt?: Date;
    public createdBy?: number;
    public updatedBy?: number;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        // Deprecated composite name retained temporarily (nullable) during migration.
        firstName: { type: DataTypes.STRING(100), allowNull: false },
        middleName: { type: DataTypes.STRING(100), allowNull: true },
        lastName: { type: DataTypes.STRING(100), allowNull: false },
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
            type: DataTypes.ENUM('superadmin', 'admin', 'staff', 'teacher', 'student', 'accountant', 'engineer', 'guest', 'guardian'),
            allowNull: false,
        },
        sex: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        profile: { type: DataTypes.STRING(255), allowNull: true },
        profilePicture: { type: DataTypes.STRING(255), allowNull: true },
        dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
        fatherName: { type: DataTypes.STRING(255), allowNull: true },
        motherName: { type: DataTypes.STRING(255), allowNull: true },
        grandfatherName: { type: DataTypes.STRING(255), allowNull: true },
        grandmotherName: { type: DataTypes.STRING(255), allowNull: true },
        guardianName: { type: DataTypes.STRING(255), allowNull: true },
        guardianContact: { type: DataTypes.STRING(50), allowNull: true },
        fatherNumber: { type: DataTypes.STRING(50), allowNull: true },
        motherNumber: { type: DataTypes.STRING(50), allowNull: true },
        emergencyContact: { type: DataTypes.STRING(50), allowNull: true },
        country: { type: DataTypes.STRING(100), allowNull: true },
        permanentState: { type: DataTypes.STRING(100), allowNull: true },
        permanentCity: { type: DataTypes.STRING(100), allowNull: true },
        permanentLocalGovernment: { type: DataTypes.STRING(100), allowNull: true },
        permanentWardNumber: { type: DataTypes.STRING(10), allowNull: true },
        permanentTole: { type: DataTypes.STRING(255), allowNull: true },
        permanentPostalCode: { type: DataTypes.STRING(20), allowNull: true },
        tempState: { type: DataTypes.STRING(100), allowNull: true },
        tempCity: { type: DataTypes.STRING(100), allowNull: true },
        tempLocalGovernment: { type: DataTypes.STRING(100), allowNull: true },
        tempWardNumber: { type: DataTypes.STRING(10), allowNull: true },
        tempTole: { type: DataTypes.STRING(255), allowNull: true },
        tempPostalCode: { type: DataTypes.STRING(20), allowNull: true },
        status: { type: DataTypes.ENUM('Graduated', 'Enrolled', 'Left', 'Pending'), allowNull: false, defaultValue: 'Pending' },
        graduatedDate: { type: DataTypes.DATEONLY, allowNull: true },
        leaveReason: { type: DataTypes.TEXT, allowNull: true },
        dateofjoin: { type: DataTypes.DATEONLY, allowNull: true },
        dateofleave: { type: DataTypes.DATEONLY, allowNull: true },
        remark: { type: DataTypes.TEXT, allowNull: true },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        createdAt: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
        createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        updatedBy: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'tbl_users',
        timestamps: false,
    }
);

export default User;