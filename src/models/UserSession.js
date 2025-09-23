"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class UserSession extends sequelize_1.Model {
    // Association method
    static associate(models) {
        UserSession.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    }
}
UserSession.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'tbl_users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    accessToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    refreshToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    deviceInfo: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
    },
    browserInfo: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
    },
    deviceType: {
        type: sequelize_1.DataTypes.ENUM('mobile', 'tablet', 'desktop'),
        allowNull: false,
    },
    platform: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING(45),
        allowNull: false,
    },
    userAgent: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    lastActivity: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    loginTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    logoutTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    tableName: 'tbl_user_sessions',
    timestamps: true,
});
exports.default = UserSession;
