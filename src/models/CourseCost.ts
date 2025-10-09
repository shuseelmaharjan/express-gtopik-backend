import {DataTypes, Model, Optional} from "sequelize";
import sequelize from "../config/database";

interface ClassSectionAttributes {
    id: number;
    currency: string;
    cost: number;
    course_id: number;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    isActive: boolean;
}

type ClassSectionCreationAttributes = Optional<ClassSectionAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class CourseCost extends Model<ClassSectionAttributes, ClassSectionCreationAttributes> implements ClassSectionAttributes {
    public id!: number;
    public currency!: string;
    public cost!: number;
    public course_id!: number;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
    public isActive!: boolean;
}

CourseCost.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        course_id: {
            type: DataTypes.INTEGER,
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
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        sequelize,
        tableName: "tbl_course_costs"
    }
);
export default CourseCost;