import User from "../models/User";
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

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
     * Status rule: if role === 'student' -> status = 'Enrolled' else null
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

        const status = payload.role === 'student' ? 'Enrolled' : null;

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
            status,
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

        // Enforce status rule
        if (user.role === 'student') {
            user.status = 'Enrolled';
        } else {
            user.status = null as any;
        }

        user.updatedAt = new Date();
        await user.save();
        const plain = user.get({ plain: true }) as any;
        delete plain.password;
        return plain;
    }
}