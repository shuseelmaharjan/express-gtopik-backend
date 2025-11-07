import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface GalleryAttributes {
    id: number;
    imageUrl: string;
    caption: string | null;
    isActive: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

type GalleryCreationAttributes = Optional<GalleryAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Gallery extends Model<GalleryAttributes, GalleryCreationAttributes> implements GalleryAttributes {
    public id!: number;
    public imageUrl!: string;
    public caption!: string | null;
    public isActive!: boolean;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}

Gallery.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        caption: {
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
        tableName: 'tbl_galleries'
    }
);

export default Gallery;
