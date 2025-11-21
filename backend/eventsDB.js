const sqlite3 = require("sqlite3").verbose();
const eventsDB = new sqlite3.Database("./events.db");

eventsDB.serialize(() => {
  eventsDB.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist_id INTEGER,
        content TEXT,
        event_date TEXT
        year INTEGER,
        FOREIGN KEY (artist_id) REFERENCES artists(id)
      )
  `);

});

module.exports = eventsDB;