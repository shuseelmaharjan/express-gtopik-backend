import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_PORT,
} = process.env;

let pool: mysql.Pool;

const connectDatabase = async (): Promise<mysql.Pool> => {
  try {
    // Step 1: Connect without a database
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      port: Number(DB_PORT),
    });

    // Step 2: Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`Database "${DB_NAME}" is ready`);

    // Step 3: Close initial connection
    await connection.end();

    // Step 4: Create and return pool connected to the DB
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      port: Number(DB_PORT),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    return pool;
  } catch (err) {
    console.error('MySQL connection failed:', err);
    throw err;
  }
};

export default connectDatabase;
export { pool };
