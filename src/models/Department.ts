import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DepartmentAttributes {
    id: number;
    facultyId: number;
    departmentName: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string
    isActive: boolean;
}

type DepartmentCreationAttributes = Optional<DepartmentAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes> implements DepartmentAttributes {
    public id!: number;
    public facultyId!: number;
    public departmentName!: string;
    public createdAt!: Date;
    public createdBy!: string;
    public updatedBy!: string;
    public updatedAt!: Date;
    public isActive!: boolean;

    // Association method
    static associate(models: any) {
        Department.belongsTo(models.Faculty, {
            foreignKey: 'facultyId',
            as: 'faculty'
        });
    }
}

Department.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        facultyId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        departmentName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        createdBy: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
        tableName: 'tbl_departments',
        timestamps: false, 
    }
);

export default Department;