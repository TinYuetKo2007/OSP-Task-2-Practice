const sqlite3 = require("sqlite3").verbose();
const usersDB = new sqlite3.Database("./users.db");

// Create users table
usersDB.serialize(() => {
  usersDB.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
});


module.exports = usersDB;