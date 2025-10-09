import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CourseAttributes {
    id: number;
    title: string;
    description: string;
    duration: number;
    image: string;
    coverImage: string;
    popular: boolean;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    slug: string;
    department_id: number;
    createdBy: string;
    updatedBy?: string; // Optional field for tracking updates
}

type CourseCreationAttributes = Optional<CourseAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
    public id!: number;
    public title!: string;
    public description!: string;
    public duration!: number;
    public image!: string;
    public coverImage!: string;
    public popular!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
    public isActive!: boolean;
    public slug!: string;
    public department_id!: number;
    public createdBy!: string;
    public updatedBy?: string; // Optional field for tracking updates
}

Course.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        duration: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        coverImage: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        popular: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        },
        department_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'tbl_departments',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        createdBy: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(255),
            allowNull: true, // Optional field for tracking updates
        }
    },
    {
        sequelize,
        tableName: 'tbl_courses',
        timestamps: false, // We're managing timestamps manually
        hooks: {
            beforeUpdate: (course: Course) => {
                course.updatedAt = new Date();
            }
        }
    }
);

export default Course;
