require('dotenv').config();
const logger = require('./utils/logger');

const { Pool } = require('pg');

const pool = new Pool ({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    max: 20,                  
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// DB query with logging and error handling
const query = async (text, params) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Executed query:', text, 'with params:', params);
    }
    
    try {
        return await pool.query(text, params);
    } catch (err) {
        logger.error('Database query failed', {
            query: text,
            params,
            error: err.message
        });
        throw err;
    }
};


module.exports = {
    query,
}