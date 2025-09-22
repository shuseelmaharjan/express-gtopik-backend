import bcrypt from 'bcrypt';
import User from '../models/User';
import { DateTimeHelper } from './DateTimeHelper';

export const createSuperAdmin = async (): Promise<void> => {
  try {
    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({
      where: { username: 'admin' }
    });

    if (existingSuperAdmin) {
      console.log('Superadmin user already exists');
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin', saltRounds);

    // Get current date using DateTimeHelper
    const joinDate = DateTimeHelper.getDateObject(); // Use helper method for database storage
    
    // Log timezone information for debugging
    DateTimeHelper.logTimezoneInfo();

    // Create superadmin user
    await User.create({
      name: 'System Administrator',
      email: 'admin@system.com',
      username: 'admin',
      password: hashedPassword,
      role: 'superadmin',
      dateofjoin: joinDate,
      sex:'male',
      isActive: true
    });

    // console.log('Superadmin user created successfully');
    // console.log('Username: admin');
    // console.log('Password: admin');
    // console.log('Role: superadmin');
    // console.log(`Date of Join: ${DateTimeHelper.formatDate(joinDate)} (${DateTimeHelper.getTimezone()})`);
  } catch (error) {
    console.error('Error creating superadmin user:', error);
    throw error;
  }
};
