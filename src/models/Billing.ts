import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface BillingAttributes{
    id: number;
    userId: number;
    amount: number;
    currency: string;
    billingType: 'advance' | 'regular';
    remark: string | null;
    createdBy: string;
    updatedBy: string | null;
    updatedRemark: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

interface BillingCreationAttributes extends Optional<BillingAttributes, 'id' | 'remark' | 'updatedBy' | 'updatedRemark' | 'createdAt' | 'updatedAt'> {}

class Billing extends Model<BillingAttributes, BillingCreationAttributes> implements BillingAttributes {
    public id!: number;
    public userId!: number;
    public amount!: number;
    public currency!: string;
    public billingType!: 'advance' | 'regular';
    public remark!: string | null;
    public createdBy!: string;
    public updatedBy!: string | null;
    public updatedRemark!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date | null;
}

Billing.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'NPR'
        },
        billingType: {
            type: DataTypes.ENUM('advance', 'regular'),
            allowNull: false,
            validate: {
                isIn: {
                    args: [['advance', 'regular']],
                    msg: "Billing type must be either 'advance' or 'regular'"
                }
            }
        },
        remark: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdBy: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        updatedBy: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        updatedRemark: {
            type: DataTypes.TEXT,
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
        tableName: 'tbl_billing',
        timestamps: true
    }
);

export default Billing;
