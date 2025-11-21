const sqlite3 = require("sqlite3").verbose();
const songsDB = new sqlite3.Database("./songs.db");

songsDB.serialize(() => {
  songsDB.run(`
      CREATE TABLE IF NOT EXISTS artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);

  songsDB.run(`
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist_id INTEGER,
        genre TEXT,
        year INTEGER,
        FOREIGN KEY (artist_id) REFERENCES artists(id)
      )
  `);
});


module.exports = songsDB;