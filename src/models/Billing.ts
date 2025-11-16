import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface BillingAttributes{
    id: number;
    billId: string;
    userId: number;
    amount: number;
    currency: 'npr';
    paymentType: 'cash_on_hand' | 'fonepay' | 'esewa' | 'khalti';
    billingType: 'advance' | 'partial';
    remark: string | null;
    createdBy: string;
    updatedBy: string | null;
    updatedRemark: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

interface BillingCreationAttributes extends Optional<BillingAttributes, 'id' | 'billId' | 'remark' | 'updatedBy' | 'updatedRemark' | 'createdAt' | 'updatedAt'> {}

class Billing extends Model<BillingAttributes, BillingCreationAttributes> implements BillingAttributes {
    public id!: number;
    public billId!: string;
    public userId!: number;
    public amount!: number;
    public currency!: 'npr';
    public paymentType!: 'cash_on_hand' | 'fonepay' | 'esewa' | 'khalti';
    public billingType!: 'advance' | 'partial';
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
        billId: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
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
            type: DataTypes.ENUM('npr'),
            allowNull: false,
            defaultValue: 'npr'
        },
        paymentType: {
            type: DataTypes.ENUM('cash_on_hand', 'fonepay', 'esewa', 'khalti'),
            allowNull: false,
            validate: {
                isIn: {
                    args: [['cash_on_hand', 'fonepay', 'esewa', 'khalti']],
                    msg: "Payment type must be 'cash_on_hand', 'fonepay', 'esewa', or 'khalti'"
                }
            }
        },
        billingType: {
            type: DataTypes.ENUM('advance', 'partial'),
            allowNull: false,
            validate: {
                isIn: {
                    args: [['advance', 'partial']],
                    msg: "Billing type must be either 'advance' or 'partial'"
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
