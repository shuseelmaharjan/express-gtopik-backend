import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

interface StudentEnrollmentAttributes {
    id: number;
    user_id: number;
    department_id: number;
    course_id: number;
    class_id: number;
    section_id: number;
    enrollmentDate: Date;
    totalFees: number;
    discount: number;
    discountType?: string;
    netFees: number;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    isActive: boolean;
    remarks?: string;
}

type StudentEnrollmentCreationAttributes = Optional<StudentEnrollmentAttributes, 'id' | 'updatedBy' | 'createdAt' | 'updatedAt'>;

export class StudentEnrollment extends Model<StudentEnrollmentAttributes, StudentEnrollmentCreationAttributes> implements StudentEnrollmentAttributes {
    public id!: number;
    public user_id!: number;
    public department_id!: number;
    public course_id!: number;
    public class_id!: number;
    public section_id!: number;
    public enrollmentDate!: Date;
    public totalFees!: number;
    public discount!: number;
    public discountType?: string;
    public netFees!: number;
    public createdBy!: string;
    public updatedBy!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date | null;
    public isActive!: boolean;
    public remarks?: string;
}

StudentEnrollment.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        department_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        course_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        class_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        section_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        enrollmentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        totalFees: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                isDecimal: true,
                min: 0,
            },
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                isDecimal: true,
                min: 0,
            },
        },
        discountType: {
            type: DataTypes.ENUM('scholarship', 'regular', 'other', 'none'),
            allowNull: true,
        },
        netFees: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                isDecimal: true,
                min: 0,
            },
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'StudentEnrollment',
        tableName: 'tbl_student_enrollments',
        timestamps: false,
        // Temporarily disable foreign key constraints during table creation
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['department_id']
            },
            {
                fields: ['course_id']
            },
            {
                fields: ['class_id']
            },
            {
                fields: ['section_id']
            },
            {
                fields: ['enrollmentDate']
            },
            {
                fields: ['isActive']
            }
        ]
    }
);

export default StudentEnrollment;
    