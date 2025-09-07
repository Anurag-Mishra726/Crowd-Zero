import dotenv from 'dotenv';
dotenv.config();

import mysql2 from 'mysql2';

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: Number(process.env.DB_PORT),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true, 
    connectionLimit: 5,
});

export default pool.promise();