import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface CareerAttributes {
    id: number;
    position: string;
    description: string;
    requirements: string;
    startsFrom: Date | null;
    endsAt: Date | null;
    isActive: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

type CareerCreationAttributes = Optional<CareerAttributes, 'id' | 'startsFrom' | 'endsAt' | 'createdAt' | 'updatedAt'>;

class Career extends Model<CareerAttributes, CareerCreationAttributes> implements CareerAttributes {
    public id!: number;
    public position!: string;
    public description!: string;
    public requirements!: string;
    public startsFrom!: Date | null;
    public endsAt!: Date | null;
    public isActive!: boolean;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}
Career.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        requirements: {
            type: DataTypes.STRING,
            allowNull: false
        },
        startsFrom: {
            type: DataTypes.DATE,
            allowNull: true
        },
        endsAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        tableName: 'tbl_careers'
    }
);

export default Career;
