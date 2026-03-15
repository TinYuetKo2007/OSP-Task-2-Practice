CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        forename TEXT,
        surname TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
        )
CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        priceId TEXT NOT NULL,
        productId TEXT UNIQUE
      )
CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT,
        priceId TEXT NOT NULL,
        productId TEXT UNIQUE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(productId)
      )