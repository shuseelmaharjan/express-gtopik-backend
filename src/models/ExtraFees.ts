import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface ExtraFeesAttributes {
    id: number;
    student_id: number;
    fee_rule_id: number;
    amount: number;
    currency: string;
    expiry_date: Date;
    isPaid: boolean;
    createdAt: Date;
    updatedAt: Date;
    created_by: number;
    updated_by: number;
}

interface ExtraFeesCreationAttributes extends Optional<ExtraFeesAttributes, 'id' | 'createdAt' | 'updatedAt' | 'created_by' | 'updated_by'> {}

class ExtraFees extends Model<ExtraFeesAttributes, ExtraFeesCreationAttributes> implements ExtraFeesAttributes {
    public id!: number;
    public student_id!: number;
    public fee_rule_id!: number;
    public amount!: number;
    public currency!: string;
    public expiry_date!: Date;
    public isPaid!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
    public created_by!: number;
    public updated_by!: number;
}

ExtraFees.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        student_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        fee_rule_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'NPR',
            validate: {
                isIn: [['USD', 'NPR', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY']]
            }
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        created_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'tbl_extra_fees'
    }
);

export default ExtraFees;