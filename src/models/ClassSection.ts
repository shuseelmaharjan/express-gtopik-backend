import {DataTypes, Model, Optional} from "sequelize";
import sequelize from "../config/database";

interface ClassSectionAttributes {
    id: number;
    class_id: number;
    sectionName: string;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    isActive: boolean;
}

type ClassSectionCreationAttributes = Optional<ClassSectionAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class ClassSection extends Model<ClassSectionAttributes, ClassSectionCreationAttributes> implements ClassSectionAttributes {
    public id!: number;
    public class_id!: number;
    public sectionName!: string;
    public createdBy!: string;
    public updatedBy!: string | null
    public createdAt!: Date;
    public updatedAt!: Date | null;
    public isActive!: boolean;
}

ClassSection.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        class_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'tbl_classes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        sectionName: {
            type: DataTypes.STRING,
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
        tableName: "tbl_class_sections",
        modelName: "ClassSection",
        timestamps: false,
    }
);

export default ClassSection;
