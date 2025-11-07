import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';


interface AdsAttributes {
    id: number;
    image: string;
    title: string;
    subtitle: string;
    link: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

type AdsCreationAttributes = Optional<AdsAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Ads extends Model<AdsAttributes, AdsCreationAttributes> implements AdsAttributes {
    public id!: number;
    public image!: string;
    public title!: string;
    public subtitle!: string;
    public link!: string;
    public isActive!: boolean;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}

Ads.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        subtitle: {
            type: DataTypes.STRING,
            allowNull: false
        },
        link: {
            type: DataTypes.STRING,
            allowNull: false
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
        tableName: 'tbl_ads'
    }
);

export default Ads;