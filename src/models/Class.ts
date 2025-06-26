import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ClassAttributes {
    id: number;
    course_id: number;
    faculty_id: number;
    shift_id: number;
    startFrom: Date;
    endAt: Date;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

type ClassCreationAttributes = Optional<ClassAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Class extends Model<ClassAttributes, ClassCreationAttributes> implements ClassAttributes {
    public id!: number;
    public course_id!: number;
    public faculty_id!: number;
    public shift_id!: number;
    public startFrom!: Date;
    public endAt!: Date;
    public createdBy!: string;
    public updatedBy!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public isActive!: boolean;
}

Class.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        course_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'tbl_courses',
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
        shift_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'tbl_shifts',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        startFrom: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
