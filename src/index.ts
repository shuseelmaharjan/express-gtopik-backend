import app from './app';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { createSuperAdmin } from './utils/seedData';


//Import database Objects
import './models/User';
import './models/Faculty';
import './models/Courses';
import './models/Shifts';
import './models/Class';


dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ force: true }); 

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