const sqlite3 = require("sqlite3");

let db = new sqlite3.Database("./db.sqlite3", (error) => {
  if (error) {
    console.error("Error opening database: " + error.message);
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
      email TEXT,
      subOrganizationId TEXT,
      emailVerified INTEGER DEFAULT 0
    )`,
      (error) => {
        if (error) {
          console.error("Error creating table: " + error.message);
        }
      },
    );
  }
});

const addUser = async (email, subOrganizationId, emailVerified) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO users (email, subOrganizationId, emailVerified) VALUES (?, ?, ?)`;
    db.run(sql, [email, subOrganizationId, emailVerified], (error) => {
      if (error) {
        console.error("Could not insert user: " + error.message);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const findUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT email, subOrganizationId, emailVerified FROM users WHERE email = ?`;
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        if (row) {
          resolve(row);
        } else {
          resolve(undefined);
        }
      }
    });
  });
};

const verifyUserEmail = async (email) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE users SET emailVerified = 1 WHERE email = ?`;
    db.run(sql, [email], function (err) {
      if (err) {
        reject(err);
      } else {
        if (this.changes > 0) {
          resolve();
        } else {
          console.log("No user found with that email to verify.");
          reject(new Error("No user found with that email to verify."));
        }
      }
    });
  });
};

module.exports = {
  addUser,
  findUserByEmail,
  verifyUserEmail,
};
