import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';


interface PrincipalMessageAttributes {
    id: number;
    message: string;
    profilePicture: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

type PrincipalMessageCreationAttributes = Optional<PrincipalMessageAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class PrincipalMessage extends Model<PrincipalMessageAttributes, PrincipalMessageCreationAttributes> implements PrincipalMessageAttributes {
    public id!: number;
    public message!: string;
    public profilePicture!: string;
    public isActive!: boolean;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}

PrincipalMessage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updatedBy: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'tbl_principal_message'
    }
);