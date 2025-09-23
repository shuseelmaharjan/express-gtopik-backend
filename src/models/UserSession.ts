import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserSessionAttributes {
    id: number;
    userId: number;
    sessionId: string;
    accessToken: string;
    refreshToken?: string;
    deviceInfo: string;
    browserInfo: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    platform: string; // ios, android, windows, mac, linux
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
    lastActivity: Date;
    loginTime: Date;
    logoutTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

type UserSessionCreationAttributes = Optional<UserSessionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'logoutTime'>;

class UserSession extends Model<UserSessionAttributes, UserSessionCreationAttributes> implements UserSessionAttributes {
    public id!: number;
    public userId!: number;
    public sessionId!: string;
    public accessToken!: string;
    public refreshToken?: string;
    public deviceInfo!: string;
    public browserInfo!: string;
    public deviceType!: 'mobile' | 'tablet' | 'desktop';
    public platform!: string;
    public ipAddress!: string;
    public userAgent!: string;
    public isActive!: boolean;
    public lastActivity!: Date;
    public loginTime!: Date;
    public logoutTime?: Date;
    public createdAt!: Date;
    public updatedAt!: Date;

    // Association method
    static associate(models: any) {
        UserSession.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    }
}

UserSession.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'tbl_users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        sessionId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        accessToken: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        deviceInfo: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        browserInfo: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        deviceType: {
            type: DataTypes.ENUM('mobile', 'tablet', 'desktop'),
            allowNull: false,
        },
        platform: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        ipAddress: {
            type: DataTypes.STRING(45), // IPv6 support
            allowNull: false,
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        lastActivity: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        loginTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        logoutTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'tbl_user_sessions',
        timestamps: true,
    }
);

export default UserSession;