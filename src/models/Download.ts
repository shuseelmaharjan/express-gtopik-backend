import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface DownloadAttributes {
    id: number;
    label: string;
    description: string;
    fileType: string;
    fileUrl: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}
type DownloadCreationAttributes = Optional<DownloadAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Download extends Model<DownloadAttributes, DownloadCreationAttributes> implements DownloadAttributes {
    public id!: number;
    public label!: string;
    public description!: string;
    public fileType!: string;
    public fileUrl!: string;
    public isActive!: boolean;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}

Download.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        label: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['pdf', 'image']],
                    msg: 'File type must be either pdf or image'
                }
            }
        },
        fileUrl: {
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
        tableName: 'tbl_downloads'
    }
);

export default Download;