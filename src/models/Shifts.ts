import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ShiftAttributes {
    id: number;
    shiftName: string;
    createdBy: string;
    createdAt: Date;
    isActive: boolean;
    facultyId: number;
}

type ShiftCreationAttributes = Optional<ShiftAttributes, 'id' | 'createdAt'>;

class Shift extends Model<ShiftAttributes, ShiftCreationAttributes> implements ShiftAttributes {
    public id!: number;
    public shiftName!: string;
    public createdBy!: string;
    public createdAt!: Date;
    public isActive!: boolean;
    public facultyId!: number;
}

Shift.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        shiftName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        facultyId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'tbl_faculties', // or the actual table name for faculties
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
    },
    {
        sequelize,
        tableName: 'tbl_shifts',
        timestamps: false,
    }
);

export default Shift;
