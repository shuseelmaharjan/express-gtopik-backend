import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface FeeStructureAttributes {
    id: number;
    feeType: string;
    amount: number;
    currency: string;
    description: string | null;
    requireonAdmission: boolean;
    requireonUpgrade: boolean;
    requireonRenewal: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    isActive: boolean;
}

type FeeStructureCreationAttributes = Optional<FeeStructureAttributes, 'id' | 'description' | 'updatedBy' | 'createdAt' | 'updatedAt'>;

export class FeeStructure extends Model<FeeStructureAttributes, FeeStructureCreationAttributes> implements FeeStructureAttributes {
    public id!: number;
    public feeType!: string;
    public amount!: number;
    public currency!: string;
    public description!: string | null;
    public requireonAdmission!: boolean;
    public requireonUpgrade!: boolean;
    public requireonRenewal!: boolean;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
    public isActive!: boolean;
}

FeeStructure.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        feeType: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                isDecimal: true,
                min: 0,
            },
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: true,
            defaultValue: 'npr',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        requireonAdmission: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        requireonUpgrade: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        requireonRenewal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'tbl_fee_structures',
        timestamps: true,
        underscored: true,
    }
);
export default FeeStructure;