import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';


interface AboutCompanyAttributes {
    id: number;
    description: string;
    mission: string;
    vision: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}
type AboutCompanyCreationAttributes = Optional<AboutCompanyAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class AboutCompany extends Model<AboutCompanyAttributes, AboutCompanyCreationAttributes> implements AboutCompanyAttributes {
    public id!: number;
    public description!: string;
    public mission!: string;
    public vision!: string;
    public isActive!: boolean;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}
AboutCompany.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mission: {
            type: DataTypes.STRING,
            allowNull: false
        },
        vision: {
            type: DataTypes.STRING,
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
        tableName: 'tbl_about_company'
    }
);