import User from "../models/User";
import Document from "../models/Documents";
import StudentEnrollment from "../models/StudentEnrollment";
import Class from "../models/Class";
import ClassSection from "../models/ClassSection";
import Department from "../models/Department";
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { UsernameGenerator } from '../utils/usernameGenerator';
import { UserHelper } from '../utils/userHelper';
import fs from 'fs';
import path from 'path';
import { generateUniqueFileName } from '../utils/fileNameHelper';
import FeeStructure from "../models/FeeStructure";
import { create } from "domain";

export class UserService {
    // get user's username, email, role and profile by id
    static async getUserProfile(userId: number): Promise<{ firstName: string, middleName: string, lastName: string, email: string, username: string, role: string } | null> {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['firstName', 'middleName', 'lastName', 'email', 'username', 'role']
            });
            return user ? user.get({ plain: true }) as { firstName: string, middleName: string, lastName: string, email: string, username: string, role: string } : null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    }

    //deactivate user account
    static async deactivateUserAccount(userId: number): Promise<boolean> {
        try{
            const user = await User.findByPk(userId);
            if(!user){
                throw new Error("User not found");
            }
            user.isActive = false;
            await user.save();
            console.log("User ", user.username, " deactivated successfully");
            return true;
        } catch (error) {
            console.error("Error deactivating user account:", error);
            return false;
        }
    }

    /**
     * Create a new user.
     * Required: firstName, lastName, email, username, role, sex
     * Status rule: if role === 'student' -> status = 'Pending' else null
     * isActive forced true.
     */
    static async createUser(payload: any) {
        const required = ['firstName','lastName','email','username','role','sex'];
        const missing = required.filter(f => !payload[f]);
        if (missing.length) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Uniqueness check for email/username
        const existing = await User.findOne({ where: { [Op.or]: [{ email: payload.email }, { username: payload.username }] } });
        if (existing) {
            throw new Error('Email or username already exists');
        }

        // Password handling
        let password = payload.password;
        if (!password) {
            password = Math.random().toString(36).slice(2,12) + '!A1';
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            firstName: payload.firstName,
            middleName: payload.middleName || null,
            lastName: payload.lastName,
            email: payload.email,
            username: payload.username,
            role: payload.role,
            password: hashedPassword,
            sex: payload.sex,
            dateOfBirth: payload.dateOfBirth || payload.dateofBirth || null,
            fatherName: payload.fatherName || null,
            motherName: payload.motherName || null,
            grandfatherName: payload.grandfatherName || null,
            grandmotherName: payload.grandmotherName || payload.grandMotherName || null,
            guardianName: payload.guardianName || null,
            guardianContact: payload.guardianContact || null,
            fatherNumber: payload.fatherNumber || null,
            motherNumber: payload.motherNumber || null,
            emergencyContact: payload.emergencyContact || null,
            country: payload.country || null,
            permanentState: payload.permanentState || null,
            permanentCity: payload.permanentCity || null,
            permanentLocalGovernment: payload.permanentLocalGovernment || null,
            permanentWardNumber: payload.permanentWardNumber || null,
            permanentTole: payload.permanentTole || payload.permanenetTole || null,
            permanentPostalCode: payload.permanentPostalCode || null,
            tempState: payload.tempState || null,
            tempCity: payload.tempCity || null,
            tempLocalGovernment: payload.tempLocalGovernment || null,
            tempWardNumber: payload.tempWardNumber || null,
            tempTole: payload.tempTole || null,
            tempPostalCode: payload.tempPostalCode || null,
            dateofjoin: payload.dateofjoin || null,
            status: 'Pending',
            isActive: true
        } as any);

        const plain = user.get({ plain: true });
        return { ...plain, password: undefined, generatedPassword: payload.password ? undefined : password };
    }

    /**
     * Get full user by id (all attributes except password)
     */
    static async getUserByIdFull(id: number) {
        const user = await User.findByPk(id);
        if (!user) return null;
        const plain = user.get({ plain: true }) as any;
        delete plain.password;
        return plain;
    }

    /**
     * Update user with allowed fields. Status logic enforced.
     */
    static async updateUser(id: number, payload: any) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');

        const updatable = [
            'firstName','middleName','lastName','email','role','sex','fatherName','motherName',
            'grandfatherName','grandmotherName','guardianName','guardianContact','fatherNumber','motherNumber',
            'emergencyContact','country','permanentState','permanentCity','permanentLocalGovernment','permanentWardNumber',
            'permanentTole','permanentPostalCode','tempState','tempCity','tempLocalGovernment','tempWardNumber',
            'tempTole','tempPostalCode','dateOfBirth','dateofBirth'
        ];

        for (const key of updatable) {
            if (payload[key] !== undefined) {
                switch (key) {
                    case 'dateofBirth':
                        (user as any).dateOfBirth = payload.dateofBirth; break;
                    default:
                        (user as any)[key] = payload[key];
                }
            }
        }
        user.updatedAt = new Date();
        await user.save();
        const plain = user.get({ plain: true }) as any;
        delete plain.password;
        return plain;
    }

    /**
     * Create user with comprehensive data handling and document upload support
     * Supports both 'new' and 'transferred' admission types with different document requirements
     */
    static async createUserWithDocuments(payload: any, files: any, createdBy: number) {
        console.log("Payload Data:", payload);
        const required = ['firstName', 'lastName', 'email', 'role', 'sex', 'admissionType'];
        const missing = required.filter(f => !payload[f]);
        if (missing.length) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Validate admission type
        if (!['new', 'transferred'].includes(payload.admissionType)) {
            throw new Error('admissionType must be either "new" or "transferred"');
        }

        // Check for existing email
        const existingUser = await User.findOne({ where: { email: payload.email } });
        if (existingUser) {
            throw new Error('Email already exists');
        }

        // Generate unique username
        const username = await UsernameGenerator.generateUniqueUsername();

        // Hash default password
        const hashedPassword = await bcrypt.hash('Shuseel', 12);

        // Validate required files based on admission type
        if (payload.admissionType === 'new') {
            if (!files?.photo || !files?.birthCertificate) {
                throw new Error('For new admission, both photo and birthCertificate files are required');
            }
        } else if (payload.admissionType === 'transferred') {
            const requiredFiles = ['photo', 'birthCertificate', 'characterCertificate', 'application', 'transcript'];
            const missingFiles = requiredFiles.filter(file => !files?.[file]);
            if (missingFiles.length > 0) {
                throw new Error(`For transferred admission, following files are required: ${missingFiles.join(', ')}`);
            }
        }

        try {
            // Create user
            const user = await User.create({
                firstName: payload.firstName,
                middleName: payload.middleName || null,
                lastName: payload.lastName,
                email: payload.email,
                username: username,
                role: payload.role,
                password: hashedPassword,
                sex: payload.sex,
                dateOfBirth: payload.dateOfBirth || null,
                fatherName: payload.fatherName || null,
                motherName: payload.motherName || null,
                grandfatherName: payload.grandfatherName || null,
                grandmotherName: payload.grandmotherName || null,
                guardianName: payload.guardianName || null,
                guardianContact: payload.guardianContact || null,
                fatherNumber: payload.fatherNumber || null,
                motherNumber: payload.motherNumber || null,
                emergencyContact: payload.emergencyContact || null,
                country: payload.country || null,
                permanentState: payload.permanentState || null,
                permanentCity: payload.permanentCity || null,
                permanentLocalGovernment: payload.permanentLocalGovernment || null,
                permanentWardNumber: payload.permanentWardNumber || null,
                permanentTole: payload.permanentTole || null,
                permanentPostalCode: payload.permanentPostalCode || null,
                tempState: payload.tempState || null,
                tempCity: payload.tempCity || null,
                tempLocalGovernment: payload.tempLocalGovernment || null,
                tempWardNumber: payload.tempWardNumber || null,
                tempTole: payload.tempTole || null,
                tempPostalCode: payload.tempPostalCode || null,
                remark: payload.remark || null,
                status: 'Pending',
                isActive: true,
                createdAt: new Date(),
                createdBy: createdBy,
            
            } as any);

            const userId = user.id;
            const uploadedDocuments = [];

            // Handle file uploads and document creation
            for (const [fileKey, file] of Object.entries(files)) {
                if (!file) continue;

                const fileObj = file as any;

                // Validate file
                if (fileObj.size > 5 * 1024 * 1024) { // 5MB limit
                    throw new Error(`File ${fileKey} exceeds 5MB limit`);
                }

                if (fileKey === 'photo') {
                    // Handle profile photo - upload to /uploads/profile/
                    const allowedPhotoExts = ['.jpg', '.jpeg', '.png'];
                    const photoExt = path.extname(fileObj.name).toLowerCase();
                    
                    if (!allowedPhotoExts.includes(photoExt)) {
                        throw new Error('Photo must be JPG or PNG format');
                    }

                    const profileDir = path.join(__dirname, '..', 'uploads', 'profile');
                    fs.mkdirSync(profileDir, { recursive: true });

                    const photoFileName = generateUniqueFileName(fileObj.name);
                    const photoFilePath = path.join(profileDir, photoFileName);

                    // Save photo file
                    if (typeof fileObj.mv === 'function') {
                        await new Promise<void>((resolve, reject) => {
                            fileObj.mv(photoFilePath, (err: any) => err ? reject(err) : resolve());
                        });
                    } else if (fileObj.data) {
                        fs.writeFileSync(photoFilePath, fileObj.data);
                    }

                    // Update user profile picture
                    await User.update(
                        { profile: `/uploads/profile/${photoFileName}` },
                        { where: { id: userId } }
                    );
                } else {
                    // Handle other documents - upload to /uploads/documents/
                    const documentsDir = path.join(__dirname, '..', 'uploads', 'documents');
                    fs.mkdirSync(documentsDir, { recursive: true });

                    const uniqueFileName = generateUniqueFileName(fileObj.name);
                    const documentFilePath = path.join(documentsDir, uniqueFileName);

                    // Save document file
                    if (typeof fileObj.mv === 'function') {
                        await new Promise<void>((resolve, reject) => {
                            fileObj.mv(documentFilePath, (err: any) => err ? reject(err) : resolve());
                        });
                    } else if (fileObj.data) {
                        fs.writeFileSync(documentFilePath, fileObj.data);
                    }

                    // Determine document type for database
                    let documentType: string;
                    switch (fileKey) {
                        case 'birthCertificate':
                            documentType = 'birthcertificate';
                            break;
                        case 'characterCertificate':
                            documentType = 'charactercertificate';
                            break;
                        case 'transcript':
                            documentType = 'transcript';
                            break;
                        case 'citizenship':
                            documentType = 'citizenship';
                            break;
                        case 'pan':
                            documentType = 'pan';
                            break;
                        case 'application':
                        default:
                            documentType = 'other';
                            break;
                    }

                    // Create document record
                    const document = await Document.create({
                        user_id: userId,
                        document: `/uploads/documents/${uniqueFileName}`,
                        type: documentType,
                        createdBy: createdBy,
                        createdAt: new Date()
                    });

                    uploadedDocuments.push({
                        type: documentType,
                        fileName: uniqueFileName,
                        originalName: fileObj.name
                    });
                }
            }

            const userPlain = user.get({ plain: true }) as any;
            delete userPlain.password;

            return {
                user: userPlain,
                uploadedDocuments: uploadedDocuments,
                generatedUsername: username
            };

        } catch (error) {
            console.error('Error creating user with documents:', error);
            throw error;
        }
    }

    /**
     * Get drafted users based on role and status 'Pending'
     * Supports roles: staff, teacher, student, accountant, guardian
     * Returns all user records with createdBy user information
     */
    static async getDraftedUsers(role?: string): Promise<any[]> {
        try {
            const allowedRoles = ['staff', 'teacher', 'student', 'accountant', 'guardian'];
            
            let whereCondition: any = { 
                status: 'Pending',
                isActive: true
            };

            // If role is provided, validate and filter by it
            if (role) {
                if (!allowedRoles.includes(role)) {
                    throw new Error(`Invalid role. Allowed roles are: ${allowedRoles.join(', ')}`);
                }
                whereCondition.role = role;
            } else {
                // If no role specified, get all allowed roles
                whereCondition.role = { [Op.in]: allowedRoles };
            }

            const users = await User.findAll({
                where: whereCondition,
                attributes: [
                    'id', 'firstName', 'middleName', 'lastName', 'email', 'username', 
                    'role', 'status', 'createdAt', 'isActive', 'createdBy', 'remark',
                    'dateOfBirth', 'sex', 'fatherName', 'motherName', 'guardianName',
                    'emergencyContact', 'country', 'permanentState', 'permanentCity',
                    'profile', 'profilePicture'
                ],
                order: [['createdAt', 'DESC']]
            });

            // Enhance users with createdBy user information
            const enhancedUsers = await Promise.all(
                users.map(async (user) => {
                    const userPlain = user.get({ plain: true });
                    
                    // Get createdBy user information
                    let createdByUser = null;
                    if (userPlain.createdBy) {
                        createdByUser = await UserHelper.getUserById(userPlain.createdBy);
                    }

                    return {
                        ...userPlain,
                        createdByUser: createdByUser ? {
                            id: createdByUser.id,
                            firstName: createdByUser.firstName,
                            middleName: createdByUser.middleName,
                            lastName: createdByUser.lastName,
                            fullName: `${createdByUser.firstName} ${createdByUser.middleName || ''} ${createdByUser.lastName}`.replace(/\s+/g, ' ').trim()
                        } : null
                    };
                })
            );

            return enhancedUsers;

        } catch (error) {
            console.error("Error fetching drafted users:", error);
            throw error;
        }
    }

    static async getUserInfoForEnrollment(userId: number) {
        try {
            // Get user with documents
            const user = await User.findByPk(userId, {
                attributes: [
                    'id', 'firstName', 'middleName', 'lastName', 'email', 'remark',
                    'dateOfBirth', 'sex', 'profile', 'profilePicture', 'status', 'isActive'
                ],
                include: [
                    { 
                        model: Document, 
                        as: 'documents', 
                        attributes: ['id', 'document', 'type'] 
                    }
                ]
            });

            if (!user) {
                throw new Error("User not found");
            }

            // Separately get fee structures required for admission
            const admissionFeeStructures = await FeeStructure.findAll({
                where: {
                    isActive: true,
                    requireonAdmission: true
                },
                attributes: ['id', 'feeType', 'amount', 'currency', 'description'],
                order: [['feeType', 'ASC']]
            });

            const userData = user.get({ plain: true });

            return {
                user: userData,
                admissionFeeStructures: admissionFeeStructures.map(fee => fee.get({ plain: true }))
            };
        } catch (error) {
            console.error("Error fetching user information for enrollment:", error);
            throw error;
        }
    }

    /**
     * Get all enrolled students with their enrollment information
     * Returns students with role=student, status=Enrolled, isActive=true
     * Along with their enrollment records where isActive=true
     * Includes department, class, and section names
     */
    static async getEnrolledStudentsWithEnrollmentInfo() {
        try {
            const enrolledStudents = await User.findAll({
                where: {
                    role: 'student',
                    status: 'Enrolled',
                    isActive: true
                },
                attributes: [
                    'id', 'firstName', 'middleName', 'lastName', 'username', 
                    'dateOfBirth', 'profile', 'guardianName', 'guardianContact'
                ],
                include: [
                    {
                        model: StudentEnrollment,
                        as: 'enrollments',
                        where: { isActive: true },
                        required: true, // INNER JOIN - only users with active enrollments
                        attributes: [
                            'id', 'department_id', 'course_id', 'class_id', 
                            'section_id', 'enrollmentDate', 'totalFees', 'discount', 
                            'discountType', 'netFees', 'remarks'
                        ],
                        include: [
                            {
                                model: Department,
                                as: 'department',
                                attributes: ['id', 'departmentName'],
                                required: true
                            },
                            {
                                model: Class,
                                as: 'class',
                                attributes: ['id', 'className'],
                                required: true
                            },
                            {
                                model: ClassSection,
                                as: 'section',
                                attributes: ['id', 'sectionName'],
                                required: true
                            }
                        ]
                    }
                ],
                order: [
                    ['firstName', 'ASC'],
                    ['lastName', 'ASC'],
                    [{ model: StudentEnrollment, as: 'enrollments' }, 'enrollmentDate', 'DESC']
                ]
            });

            // Transform the data to the required format
            const transformedData = enrolledStudents.map(student => {
                const studentData = student.get({ plain: true }) as any;
                
                // Combine name
                const fullName = [
                    studentData.firstName,
                    studentData.middleName,
                    studentData.lastName
                ].filter(name => name && name.trim()).join(' ');

                // Transform enrollment data
                const enrollments = studentData.enrollments.map((enrollment: any) => ({
                    enrollmentId: enrollment.id,
                    departmentId: enrollment.department_id,
                    departmentName: enrollment.department.departmentName,
                    courseId: enrollment.course_id,
                    classId: enrollment.class_id,
                    className: enrollment.class.className,
                    sectionId: enrollment.section_id,
                    sectionName: enrollment.section.sectionName,
                    enrollmentDate: enrollment.enrollmentDate,
                    totalFees: enrollment.totalFees,
                    discount: enrollment.discount,
                    discountType: enrollment.discountType,
                    netFees: enrollment.netFees,
                    remarks: enrollment.remarks
                }));

                return {
                    userId: studentData.id,
                    name: fullName,
                    username: studentData.username,
                    dateOfBirth: studentData.dateOfBirth,
                    profile: studentData.profile,
                    guardianName: studentData.guardianName,
                    guardianContact: studentData.guardianContact,
                    enrollments: enrollments
                };
            });

            return transformedData;

        } catch (error) {
            console.error("Error fetching enrolled students with enrollment info:", error);
            throw error;
        }
    }

    /**
     * Search enrolled students with their enrollment information
     * Searches by name (firstName, middleName, lastName), username, guardianName, guardianContact
     * Returns students with role=student, status=Enrolled, isActive=true
     * Along with their enrollment records where isActive=true
     * Includes department, class, and section names
     */
    static async searchEnrolledStudentsWithEnrollmentInfo(searchQuery: string) {
        try {
            if (!searchQuery || searchQuery.trim().length === 0) {
                throw new Error("Search query is required");
            }

            const searchTerm = `%${searchQuery.trim()}%`;

            const enrolledStudents = await User.findAll({
                where: {
                    role: 'student',
                    status: 'Enrolled',
                    isActive: true,
                    [Op.or]: [
                        { firstName: { [Op.like]: searchTerm } },
                        { middleName: { [Op.like]: searchTerm } },
                        { lastName: { [Op.like]: searchTerm } },
                        { username: { [Op.like]: searchTerm } },
                        { guardianName: { [Op.like]: searchTerm } },
                        { guardianContact: { [Op.like]: searchTerm } }
                    ]
                },
                attributes: [
                    'id', 'firstName', 'middleName', 'lastName', 'username', 
                    'dateOfBirth', 'profile', 'guardianName', 'guardianContact'
                ],
                include: [
                    {
                        model: StudentEnrollment,
                        as: 'enrollments',
                        where: { isActive: true },
                        required: true, // INNER JOIN - only users with active enrollments
                        attributes: [
                            'id', 'department_id', 'course_id', 'class_id', 
                            'section_id', 'enrollmentDate', 'totalFees', 'discount', 
                            'discountType', 'netFees', 'remarks'
                        ],
                        include: [
                            {
                                model: Department,
                                as: 'department',
                                attributes: ['id', 'departmentName'],
                                required: true
                            },
                            {
                                model: Class,
                                as: 'class',
                                attributes: ['id', 'className'],
                                required: true
                            },
                            {
                                model: ClassSection,
                                as: 'section',
                                attributes: ['id', 'sectionName'],
                                required: true
                            }
                        ]
                    }
                ],
                order: [
                    ['firstName', 'ASC'],
                    ['lastName', 'ASC'],
                    [{ model: StudentEnrollment, as: 'enrollments' }, 'enrollmentDate', 'DESC']
                ]
            });

            // Transform the data to the required format
            const transformedData = enrolledStudents.map(student => {
                const studentData = student.get({ plain: true }) as any;
                
                // Combine name
                const fullName = [
                    studentData.firstName,
                    studentData.middleName,
                    studentData.lastName
                ].filter(name => name && name.trim()).join(' ');

                // Transform enrollment data
                const enrollments = studentData.enrollments.map((enrollment: any) => ({
                    enrollmentId: enrollment.id,
                    departmentId: enrollment.department_id,
                    departmentName: enrollment.department.departmentName,
                    courseId: enrollment.course_id,
                    classId: enrollment.class_id,
                    className: enrollment.class.className,
                    sectionId: enrollment.section_id,
                    sectionName: enrollment.section.sectionName,
                    enrollmentDate: enrollment.enrollmentDate,
                    totalFees: enrollment.totalFees,
                    discount: enrollment.discount,
                    discountType: enrollment.discountType,
                    netFees: enrollment.netFees,
                    remarks: enrollment.remarks
                }));

                return {
                    userId: studentData.id,
                    name: fullName,
                    username: studentData.username,
                    dateOfBirth: studentData.dateOfBirth,
                    profile: studentData.profile,
                    guardianName: studentData.guardianName,
                    guardianContact: studentData.guardianContact,
                    enrollments: enrollments
                };
            });

            return transformedData;

        } catch (error) {
            console.error("Error searching enrolled students with enrollment info:", error);
            throw error;
        }
    }

    //get user all info by id
    static async getUserAllInformationById(id: number){
        try{
            const user = await User.findByPk(id);
            if(!user){
                throw new Error("User not found");
            }
            //personal info includes
            const personalInfo = {
                id: user.id,
                name: [user.firstName, user.middleName, user.lastName].filter(n => n).join(' '),
                email: user.email,
                username: user.username,
                role: user.role,
                profile: user.profile,
                dateOfBirth: user.dateOfBirth,
                sex: user.sex,


            }
            // guardian info includes
            const guardianInfo = {
                fatherName: user.fatherName,
                motherName: user.motherName,
                grandfatherName: user.grandfatherName,
                grandmotherName: user.grandmotherName,
                guardianName: user.guardianName,
                guardianContact: user.guardianContact,
                fatherNumber: user.fatherNumber,
                motherNumber: user.motherNumber,
                emergencyContact: user.emergencyContact,
            }

            // address info includes
            const addressInfo = {
                country: user.country,
                permanentState: user.permanentState,
                permanentCity: user.permanentCity,
                permanentLocalGovernment: user.permanentLocalGovernment,
                permanentWardNumber: user.permanentWardNumber,
                permanentTole: user.permanentTole,
                permanentPostalCode: user.permanentPostalCode,
                tempState: user.tempState,
                tempCity: user.tempCity,
                tempLocalGovernment: user.tempLocalGovernment,
                tempWardNumber: user.tempWardNumber,
                tempTole: user.tempTole,
                tempPostalCode: user.tempPostalCode,
            }

            // account status includes
            const accountStatus = {
                status: user.status,
                isActive: user.isActive,
                leftDate: user.leftDate,
                graduatedDate: user.graduatedDate,
                leaveReason: user.leaveReason,
            }

            let updatedByUser = null;
            let createdByUser = null;

            if(user.updatedBy != null){
                updatedByUser = await UserHelper.getUserFullNameById(user.updatedBy);
            }
            if(user.createdBy != null){
                createdByUser = await UserHelper.getUserFullNameById(user.createdBy);
            }
            // account created and updated info
            const accountCreatedUpdatedInfo = {
                createdAt: user.createdAt,
                createdBy: createdByUser,
                updatedBy: updatedByUser,
                updatedAt: user.updatedAt,
            }

            const userDocuments = await Document.findAll({
                where: { user_id: user.id },
            });

            const userDocumentInfo = await Promise.all(
                userDocuments.map(async (doc) => {
                    const docData = doc.get({ plain: true }) as any;
                    let docCreatedBy = null;
                    let docUpdatedBy = null;

                    if (docData.createdBy != null) {
                        docCreatedBy = await UserHelper.getUserFullNameById(docData.createdBy);
                    }
                    if (docData.updatedBy != null) {
                        docUpdatedBy = await UserHelper.getUserFullNameById(docData.updatedBy);
                    }

                    return {
                        id: docData.id,
                        document: docData.document,
                        type: docData.type,
                        createdAt: docData.createdAt,
                        updatedAt: docData.updatedAt,
                        createdBy: docCreatedBy,
                        updatedBy: docUpdatedBy,
                    };
                })
            );

            const userActiveEnrollments = await StudentEnrollment.findAll({
                where: { user_id: user.id, isActive: true },
                include: [
                    { model: Department, as: 'department', attributes: ['id', 'departmentName'] },
                    { model: Class, as: 'class', attributes: ['id', 'className'] },
                    { model: ClassSection, as: 'section', attributes: ['id', 'sectionName'] },
                ]
            });
            
            const enrollmentInfo = await Promise.all(
                userActiveEnrollments.map(async (enrollment) => {
                    const enrollmentData = enrollment.get({ plain: true }) as any;
                    let enrollmentCreatedBy = null;
                    let enrollmentUpdatedBy = null;

                    if (enrollmentData.createdBy != null) {
                        enrollmentCreatedBy = await UserHelper.getUserFullNameById(enrollmentData.createdBy);
                    }
                    if (enrollmentData.updatedBy != null) {
                        enrollmentUpdatedBy = await UserHelper.getUserFullNameById(enrollmentData.updatedBy);
                    }

                    return {
                        id: enrollmentData.id,
                        user_id: enrollmentData.user_id,
                        department_id: enrollmentData.department_id,
                        department: enrollmentData.department ? {
                            id: enrollmentData.department.id,
                            departmentName: enrollmentData.department.departmentName
                        } : null,
                        course_id: enrollmentData.course_id,
                        class_id: enrollmentData.class_id,
                        class: enrollmentData.class ? {
                            id: enrollmentData.class.id,
                            className: enrollmentData.class.className
                        } : null,
                        section_id: enrollmentData.section_id,
                        section: enrollmentData.section ? {
                            id: enrollmentData.section.id,
                            sectionName: enrollmentData.section.sectionName
                        } : null,
                        enrollmentDate: enrollmentData.enrollmentDate,
                        totalFees: enrollmentData.totalFees,
                        discount: enrollmentData.discount,
                        discountType: enrollmentData.discountType,
                        netFees: enrollmentData.netFees,
                        createdBy: enrollmentCreatedBy,
                        updatedBy: enrollmentUpdatedBy,
                        createdAt: enrollmentData.createdAt,
                        updatedAt: enrollmentData.updatedAt,
                        isActive: enrollmentData.isActive,
                        remarks: enrollmentData.remarks
                    };
                })
            );

            const userInActiveEnrollments = await StudentEnrollment.findAll({
                where: { user_id: user.id, isActive: false },
                include: [
                    { model: Department, as: 'department', attributes: ['id', 'departmentName'] },
                    { model: Class, as: 'class', attributes: ['id', 'className'] },
                    { model: ClassSection, as: 'section', attributes: ['id', 'sectionName'] },
                ]
            });
            const inactiveEnrollmentInfo = await Promise.all(
                userInActiveEnrollments.map(async (enrollment) => {
                    const enrollmentData = enrollment.get({ plain: true }) as any;
                    let enrollmentCreatedBy = null;
                    let enrollmentUpdatedBy = null;

                    if (enrollmentData.createdBy != null) {
                        enrollmentCreatedBy = await UserHelper.getUserFullNameById(enrollmentData.createdBy);
                    }
                    if (enrollmentData.updatedBy != null) {
                        enrollmentUpdatedBy = await UserHelper.getUserFullNameById(enrollmentData.updatedBy);
                    }

                    return {
                        id: enrollmentData.id,
                        user_id: enrollmentData.user_id,
                        department_id: enrollmentData.department_id,
                        department: enrollmentData.department ? {
                            id: enrollmentData.department.id,
                            departmentName: enrollmentData.department.departmentName
                        } : null,
                        course_id: enrollmentData.course_id,
                        class_id: enrollmentData.class_id,
                        class: enrollmentData.class ? {
                            id: enrollmentData.class.id,
                            className: enrollmentData.class.className
                        } : null,
                        section_id: enrollmentData.section_id,
                        section: enrollmentData.section ? {
                            id: enrollmentData.section.id,
                            sectionName: enrollmentData.section.sectionName
                        } : null,
                        enrollmentDate: enrollmentData.enrollmentDate,
                        totalFees: enrollmentData.totalFees,
                        discount: enrollmentData.discount,
                        discountType: enrollmentData.discountType,
                        netFees: enrollmentData.netFees,
                        createdBy: enrollmentCreatedBy,
                        updatedBy: enrollmentUpdatedBy,
                        createdAt: enrollmentData.createdAt,
                        updatedAt: enrollmentData.updatedAt,
                        isActive: enrollmentData.isActive,
                        remarks: enrollmentData.remarks
                    };
                })
            );

            return { personalInfo, guardianInfo, addressInfo, accountStatus, accountCreatedUpdatedInfo, userDocumentInfo, enrollmentInfo, inactiveEnrollmentInfo };

        } catch (error) {
            console.error("Error fetching user by ID:", error);
            throw error;
        }
    }

    static async getUsersByClassId(classId: number): Promise<any[]> {
        try{
            const students = await StudentEnrollment.findAll({
                where: {
                    class_id: classId,
                    isActive: true
                },
                include: [
                    {
                        model: User,
                        as: 'student',
                        attributes: ['id', 'firstName', 'middleName', 'lastName', 'username', 'profile']
                    }
                ]
            });
            return students.map(enrollment => {
                const enrollmentData = enrollment.get({ plain: true }) as any;
                const studentData = enrollmentData.student;
                return {
                    id: studentData.id,
                    name: [studentData.firstName, studentData.middleName, studentData.lastName].filter(n => n).join(' '),
                    username: studentData.username,
                    profile: studentData.profile
                };
            });
        } catch (error) {
            console.error("Error fetching users by class ID:", error);
            throw error;
        }
    }

    /**
     * Get enrolled students with detailed enrollment info filtered by classId and optionally by sectionId
     * Returns data similar to getEnrolledStudentsWithEnrollmentInfo but filtered by class
     * Also returns available sections for the class
     * @param classId - Required class ID to filter by
     * @param sectionId - Optional section ID to further filter results
     */
    static async getEnrolledStudentsByClass(classId: number, sectionId?: number): Promise<any> {
        try {
            // First, get all available sections for this class
            const availableSections = await ClassSection.findAll({
                where: {
                    class_id: classId,
                    isActive: true
                },
                attributes: ['id', 'sectionName'],
                order: [['sectionName', 'ASC']]
            });

            // Build where condition for StudentEnrollment
            const enrollmentWhere: any = {
                class_id: classId,
                isActive: true
            };

            // Add section filter if provided
            if (sectionId) {
                enrollmentWhere.section_id = sectionId;
            }

            const enrolledStudents = await User.findAll({
                where: {
                    role: 'student',
                    status: 'Enrolled',
                    isActive: true
                },
                attributes: [
                    'id', 'firstName', 'middleName', 'lastName', 'username', 
                    'dateOfBirth', 'profile', 'guardianName', 'guardianContact'
                ],
                include: [
                    {
                        model: StudentEnrollment,
                        as: 'enrollments',
                        where: enrollmentWhere,
                        required: true, // INNER JOIN - only users with matching enrollments
                        attributes: [
                            'id', 'department_id', 'course_id', 'class_id', 
                            'section_id', 'enrollmentDate', 'totalFees', 'discount', 
                            'discountType', 'netFees', 'remarks'
                        ],
                        include: [
                            {
                                model: Department,
                                as: 'department',
                                attributes: ['id', 'departmentName'],
                                required: true
                            },
                            {
                                model: Class,
                                as: 'class',
                                attributes: ['id', 'className'],
                                required: true
                            },
                            {
                                model: ClassSection,
                                as: 'section',
                                attributes: ['id', 'sectionName'],
                                required: true
                            }
                        ]
                    }
                ],
                order: [
                    ['firstName', 'ASC'],
                    ['lastName', 'ASC'],
                    [{ model: StudentEnrollment, as: 'enrollments' }, 'enrollmentDate', 'DESC']
                ]
            });

            // Transform the data to the required format
            const transformedStudents = enrolledStudents.map(student => {
                const studentData = student.get({ plain: true }) as any;
                
                // Combine name
                const fullName = [
                    studentData.firstName,
                    studentData.middleName,
                    studentData.lastName
                ].filter(name => name && name.trim()).join(' ');

                // Transform enrollment data
                const enrollments = studentData.enrollments.map((enrollment: any) => ({
                    enrollmentId: enrollment.id,
                    departmentId: enrollment.department_id,
                    departmentName: enrollment.department.departmentName,
                    courseId: enrollment.course_id,
                    classId: enrollment.class_id,
                    className: enrollment.class.className,
                    sectionId: enrollment.section_id,
                    sectionName: enrollment.section.sectionName,
                    enrollmentDate: enrollment.enrollmentDate,
                    totalFees: enrollment.totalFees,
                    discount: enrollment.discount,
                    discountType: enrollment.discountType,
                    netFees: enrollment.netFees,
                    remarks: enrollment.remarks
                }));

                return {
                    userId: studentData.id,
                    name: fullName,
                    username: studentData.username,
                    dateOfBirth: studentData.dateOfBirth,
                    profile: `${process.env.SERVER_URL}${studentData.profile}`,
                    guardianName: studentData.guardianName,
                    guardianContact: studentData.guardianContact,
                    enrollments: enrollments
                };
            });

            // Transform available sections
            const sectionsData = availableSections.map(section => ({
                sectionId: section.id,
                sectionName: section.sectionName
            }));

            return {
                students: transformedStudents,
                availableSections: sectionsData
            };

        } catch (error) {
            console.error("Error fetching enrolled students by class:", error);
            throw error;
        }
    }

    /**
     * Update user email and dateorbirth by user ID
     * @param userId - ID of the user to update
     * @param email - New email address
     * @param dateOfBirth - New date of birth
     */
    static async updateUserEmailAndDOB(userId: number, email: string, dateOfBirth: Date): Promise<void> {
        try{
            const user = await User.findByPk(userId);
            if(!user){
                throw new Error("User not found");
            }
            user.email = email;
            user.dateOfBirth = dateOfBirth;
            await user.save();
        }catch (error){
            console.error("Error updating user email and date of birth:", error);
            throw error;
        }
    }

    /**
     * update user fatherName, motherName, grandFatherName, grandMotherName, guardianName, guardianContact, fatherNumber, motherNumber
     * @param userId - ID of the user to update
     * @param guardianInfo - Object containing guardian information to update
     */
    static async updateUserGuardianInfo(userId: number, guardianInfo: any): Promise<any> {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Only update fields explicitly provided in guardianInfo
            const allowed = [
                'fatherName', 'motherName', 'grandfatherName', 'grandmotherName',
                'guardianName', 'guardianContact', 'fatherNumber', 'motherNumber', 'emergencyContact'
            ];

            for (const key of allowed) {
                if (Object.prototype.hasOwnProperty.call(guardianInfo, key) && guardianInfo[key] !== undefined) {
                    (user as any)[key] = guardianInfo[key];
                }
            }

            user.updatedAt = new Date();
            await user.save();

            const plain = user.get({ plain: true }) as any;
            // sanitize password
            plain.password = undefined;
            return plain;
        } catch (error) {
            console.error("Error updating user guardian information:", error);
            throw error;
        }
    }

    /**
     * Update user address information
     * @param userId - ID of the user to update
     * @param addressInfo - Object containing address information to update
     */
    static async updateUserAddressInfo(userId: number, addressInfo: any): Promise<any> {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Only update fields explicitly provided in addressInfo
            const allowed = [
                'country', 'permanentState', 'permanentCity', 'permanentLocalGovernment',
                'permanentWardNumber', 'permanentTole', 'permanentPostalCode',
                'tempState', 'tempCity', 'tempLocalGovernment', 'tempWardNumber',
                'tempTole', 'tempPostalCode'
            ];

            for (const key of allowed) {
                if (Object.prototype.hasOwnProperty.call(addressInfo, key) && addressInfo[key] !== undefined) {
                    (user as any)[key] = addressInfo[key];
                }
            }

            user.updatedAt = new Date();
            await user.save();

            const plain = user.get({ plain: true }) as any;
            // sanitize password
            plain.password = undefined;
            return plain;
        } catch (error) {
            console.error("Error updating user address information:", error);
            throw error;
        }
    }
}