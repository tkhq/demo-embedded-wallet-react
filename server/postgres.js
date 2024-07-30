const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database.');
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      subOrganizationId TEXT,
      emailVerified BOOLEAN DEFAULT FALSE
    )`);
  } catch (err) {
    console.error('Error connecting to PostgreSQL: ' + err.message);
  }
};

// Ensure the database connection is established
connectDB();

const addUser = async (email, subOrganizationId, emailVerified) => {
  const sql = `INSERT INTO users (email, subOrganizationId, emailVerified) VALUES ($1, $2, $3)`;
  try {
    await pool.query(sql, [email, subOrganizationId, emailVerified]);
  } catch (error) {
    console.error('Could not insert user: ' + error.message);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  const sql = `SELECT email, subOrganizationId, emailVerified FROM users WHERE email = $1`;
  try {
    const res = await pool.query(sql, [email]);
    return res.rows[0];
  } catch (error) {
    console.error('Error finding user by email: ' + error.message);
    throw error;
  }
};

const verifyUserEmail = async (email) => {
  const sql = `UPDATE users SET emailVerified = TRUE WHERE email = $1`;
  try {
    const res = await pool.query(sql, [email]);
    if (res.rowCount > 0) {
      return;
    } else {
      console.log('No user found with that email to verify.');
      throw new Error('No user found with that email to verify.');
    }
  } catch (error) {
    console.error('Error verifying user email: ' + error.message);
    throw error;
  }
};

module.exports = {
  addUser,
  findUserByEmail,
  verifyUserEmail
};
