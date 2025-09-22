import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { createSuperAdmin } from './utils/seedData';


//Import database Objects and set up associations
import './models/associations';


dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Sync database safely:
    // - Creates tables if they don't exist
    // - Does NOT drop existing tables or data
    // - Use 'alter: true' only in development to update table structure
    await sequelize.sync({ 
      force: false,  // Never drop tables
      alter: false   // Set to true only in development to update table structure
    });

    console.log('Database synchronized successfully');

    // Create superadmin user after database sync
    await createSuperAdmin();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error starting server: ${(error as Error).message}`);
    process.exit(1);
  }
};

startServer();