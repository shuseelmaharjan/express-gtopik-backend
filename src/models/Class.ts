import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ClassAttributes {
    id: number;
    className: string;
    faculty_id: number;
    department_id: number;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    isActive: boolean;
}

type ClassCreationAttributes = Optional<ClassAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Class extends Model<ClassAttributes, ClassCreationAttributes> implements ClassAttributes {
    public id!: number;
    public className!: string;
    public department_id!: number;
    public faculty_id!: number;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
    public isActive!: boolean;
}

Class.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        className: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        department_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'tbl_departments',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        faculty_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'tbl_faculties',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
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
            defaultValue: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'tbl_classes',
        timestamps: false, // We're managing timestamps manually
        hooks: {
            beforeUpdate: (classInstance: Class) => {
                classInstance.updatedAt = new Date();
            }
        }
    }
);

export default Class;
