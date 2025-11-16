import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface OrganizationAttributes {
    id: number;
    organizationName: string;
    address: string;
    phone: string;
    email: string;
    website: string | null;
    registrationNumber: string | null;
    panNumber: string | null;
    logo: string | null;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

type OrganizationCreationAttributes = Optional<OrganizationAttributes, 'id' | 'website' | 'registrationNumber' | 'panNumber' | 'logo' | 'updatedBy' | 'createdAt' | 'updatedAt'>;

class Organization extends Model<OrganizationAttributes, OrganizationCreationAttributes> implements OrganizationAttributes {
    public id!: number;
    public organizationName!: string;
    public address!: string;
    public phone!: string;
    public email!: string;
    public website!: string | null;
    public registrationNumber!: string | null;
    public panNumber!: string | null;
    public logo!: string | null;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
}
Organization.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        organizationName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true
        },
        registrationNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        panNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true
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
        tableName: 'tbl_organizations',
        sequelize
    }
);
export default Organization;