const sqlite3 = require("sqlite3").verbose();
const calcDB = new sqlite3.Database("./calc.db");

calcDB.serialize(() => {
  calcDB.run(`CREATE TABLE IF NOT EXISTS calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carType TEXT,
    milesPerWeek INTEGER,
    busRides INTEGER,
    trainRides INTEGER,
    tramRides INTEGER,
    electricBill INTEGER,
    gasBill INTEGER,
    totalFootprint REAL
)`);
});

module.exports = calcDB;