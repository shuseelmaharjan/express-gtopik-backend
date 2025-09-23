"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('superadmin', 'admin', 'staff', 'teacher', 'student'),
        allowNull: false,
    },
    sex: {
        type: sequelize_1.DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    profile: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    fatherName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    motherName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    emergencyContact: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    permanentAddress: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    temporaryAddress: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    dob: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    dateofjoin: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    dateofleave: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    remark: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'tbl_users',
    timestamps: false,
});
exports.default = User;
