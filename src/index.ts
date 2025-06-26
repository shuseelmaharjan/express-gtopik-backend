import app from './app';
import dotenv from 'dotenv';
import connectDatabase from './config/database';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase(); 
    console.log('Connected to MySQL database');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error starting server: ${(error as Error).message}`);
    process.exit(1);
  }
};

startServer();