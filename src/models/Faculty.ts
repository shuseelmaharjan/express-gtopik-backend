import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FacultyAttributes {
    id: number;
    facultyName: string;
    createdAt: Date;
    createdBy: string;
    isActive: boolean;
}

type FacultyCreationAttributes = Optional<FacultyAttributes, 'id' | 'createdAt'>;

class Faculty extends Model<FacultyAttributes, FacultyCreationAttributes> implements FacultyAttributes {
    public id!: number;
    public facultyName!: string;
    public createdAt!: Date;
    public createdBy!: string;
    public isActive!: boolean;
}

Faculty.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        facultyName: {
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
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'tbl_faculties',
        timestamps: false, 
    }
);

export default Faculty;