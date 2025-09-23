"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Faculty extends sequelize_1.Model {
    // Association method
    static associate(models) {
        Faculty.hasMany(models.Department, {
            foreignKey: 'facultyId',
            as: 'departments'
        });
    }
}
Faculty.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    facultyName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    createdBy: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    updatedBy: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'tbl_faculties',
    timestamps: false,
});
exports.default = Faculty;
