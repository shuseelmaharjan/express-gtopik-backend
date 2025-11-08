import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface GalleryGroupAttributes {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}
type GalleryGroupCreationAttributes = Optional<GalleryGroupAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'>;

class GalleryGroup extends Model<GalleryGroupAttributes, GalleryGroupCreationAttributes> implements GalleryGroupAttributes {
    public id!: number;
    public name!: string;
    public description!: string | null;
    public isActive!: boolean; 
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}
GalleryGroup.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        createdBy: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        updatedBy: {
            type: DataTypes.STRING(255),
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
        tableName: 'tbl_gallery_groups',
        timestamps: true
    }
);

export default GalleryGroup;