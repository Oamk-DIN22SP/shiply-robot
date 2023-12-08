require('dotenv').config();
import mysql, { Pool, PoolConnection } from 'mysql2/promise';


const pool: Pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST,
  user: 'admin',
  password: process.env.PASSWORD,
  database: process.env.DB
});

(async () => {
  try {
    const connection: PoolConnection = await pool.getConnection();
    console.log('Connected to MySQL database successfully.');
    connection.release();
  } catch (err) {
    console.error('Error connecting to MySQL database:', err);
  } finally {
    return pool;
  }
})();



export default pool;