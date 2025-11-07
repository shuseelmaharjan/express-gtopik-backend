import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface BannerAttributes {
    id: number;
    banner: string;
    title: boolean;
    titleText: string | null;
    subtitle: boolean;
    subtitleText: string | null;
    isActive: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}
type BannerCreationAttributes = Optional<BannerAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Banner extends Model<BannerAttributes, BannerCreationAttributes> implements BannerAttributes {
    public id!: number;
    public banner!: string;
    public title!: boolean;
    public titleText!: string | null;
    public subtitle!: boolean;
    public subtitleText!: string | null;
    public isActive!: boolean;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}

Banner.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        banner: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        titleText: {
            type: DataTypes.STRING,
            allowNull: true
        },
        subtitle: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        subtitleText: {
            type: DataTypes.STRING,
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
        tableName: 'tbl_banners'
    }
);
export default Banner;