import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface ExamFeeAttributes {
    id: number;
    amount: number;
    currency: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}
type ExamFeeCreationAttributes = Optional<ExamFeeAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class ExamFee extends Model<ExamFeeAttributes, ExamFeeCreationAttributes> implements ExamFeeAttributes {
    public id!: number;
    public amount!: number;
    public currency!: string;
    public isActive!: boolean;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}

ExamFee.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING(10),
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
        tableName: 'tbl_exam_fees'
    }
);

export default ExamFee;