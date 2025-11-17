import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type FeeCategory =
  | 'tuition'
  | 'lab'
  | 'sports'
  | 'exam'
  | 'bus'
  | 'eca'
  | 'other';

export type RecurrenceType = 'ONCE' | 'RECURRING';

interface FeeRuleAttributes {
    id: number;
    name: string;                    // e.g. "Computer Lab Fee"
    category: FeeCategory;           // tuition, lab, sports, exam, bus, eca, other
    defaultAmount: number;           // base amount
    currency: string;                // e.g. "USD", "NPR", "INR"
    recurrenceType: RecurrenceType;  // ONCE or RECURRING
    intervalMonths: number | null;   // 1 (monthly), 3, 4, 6, 12, etc. null for ONCE
    
    // Scope (optional) – section contains hierarchy to class -> course -> department
    section_id: number | null;
    
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

type FeeRuleCreationAttributes = Optional<FeeRuleAttributes, 'id' | 'intervalMonths' | 'section_id' | 'createdAt' | 'updatedAt'>;

class FeeRule extends Model<FeeRuleAttributes, FeeRuleCreationAttributes> implements FeeRuleAttributes {
    public id!: number;
    public name!: string;
    public category!: FeeCategory;
    public defaultAmount!: number;
    public currency!: string;
    public recurrenceType!: RecurrenceType;
    public intervalMonths!: number | null;
    
    // Scope field - section contains hierarchy to class -> course -> department
    public section_id!: number | null;
    
    public isActive!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

FeeRule.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM('tuition', 'lab', 'sports', 'exam', 'bus', 'eca', 'other'),
            allowNull: false
        },
        defaultAmount: {
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
        recurrenceType: {
            type: DataTypes.ENUM('ONCE', 'RECURRING'),
            allowNull: false
        },
        intervalMonths: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            validate: {
                isPositive(value: number | null) {
                    if (value !== null && value <= 0) {
                        throw new Error('intervalMonths must be positive when specified');
                    }
                },
                checkRecurrence(value: number | null) {
                    if (this.recurrenceType === 'ONCE' && value !== null) {
                        throw new Error('intervalMonths must be null for ONCE recurrence type');
                    }
                    if (this.recurrenceType === 'RECURRING' && (value === null || value <= 0)) {
                        throw new Error('intervalMonths must be a positive number for RECURRING recurrence type');
                    }
                }
            }
        },
        section_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: 'tbl_class_sections',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        }
    },
    {
        tableName: 'tbl_fee_rules',
        sequelize,
        timestamps: true
    }
);

export default FeeRule;
