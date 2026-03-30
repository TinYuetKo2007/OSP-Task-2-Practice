require("dotenv").config();
const transporter = require("./transporter");

const jwt =  require("jsonwebtoken");
const helmet = require('helmet');
const express = require("express");
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const { appDB, fetchAll, execute } = require("./db")
const stripe = require("stripe")(process.env.STRIPE_API_KEY)
const cors = require ("cors");
const { verify } = require("./verify");
const app = express();

app.get("/", (req, res) => res.send("Connection successful"));



app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Middleware looks at code before request is sent to server
app.use(express.json());
// converts body into object
app.use(express.urlencoded({ extended: true }));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "frame-ancestors": ["'none'"]
    },
  })
);

app.use(
  helmet.frameguard({
    action: 'deny',
  })
);

// REGISTER NEW USER

app.post("/signup", async (req, res) => {
    const {username, forename, surname, email, password} = req.body;
    try {
        const hash = await bcrypt.hash(password, 10)
        appDB.run(`INSERT INTO users (username, forename, surname, email, password, role) VALUES (?,?,?,?,?,?)`, 
          [username, forename, surname, email, hash, "USER"], function (err) {
            if (err)
                return res.status(400).json({success: false, message: err.message})
            res.json({success: true})
        });
    } catch (err) {
        res.status(500).json({success: false, message: "Registration failed"})
    }
});


//LOGIN USER
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    appDB.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (!row)
        return res.status(401).json({ success: false, message: "User not found" });
  
      // Compare passwords
      const match = await bcrypt.compare(password, row.password);
      if (match) {
        console.log(process.env.JWT_LIFETIME)
        // Pass in user data + create token
        const token = jwt.sign({ username, id: row.id, role: row.role }, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_LIFETIME
        });
        res.json({ success: true, message: "Login successful", token });
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    });
  });
// User permanently deletes account
app.delete("/users/me", verify, async (req, res) => {
  try {
    const userId = req.user.id;

    await execute(appDB,
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "Account deleted"
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
});

app.delete("/users/:id", verify, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const userId = req.params.id;

  try {
    await execute(appDB, "DELETE FROM users WHERE id = ?", [userId]);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

app.delete("/products/:id", verify, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const productId = req.params.id;

  try {
    const row = await new Promise((resolve, reject) => {
      appDB.get("SELECT productId FROM products WHERE id = ?", [productId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (row && row.productId) {
      await stripe.products.update(row.productId, { active: false });
    }

    await execute(appDB, "DELETE FROM products WHERE id = ?", [productId]);

    res.json({ success: true, message: "Product removed from DB and Stripe" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// Editing data table
app.put("/:type/:id", verify, async (req, res) => {

  const { type, id } = req.params;
  const data = req.body;

  console.log("TYPE:", type);
  console.log("ID:", id);
  console.log("BODY:", data);

  try {

    if (!["products", "users"].includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    if (type === "products") {
      const { title, price, description } = data;

      if (!title || price === undefined || !description) {
        return res.status(400).json({ error: "Missing fields" });
      }

      await db.query(
        "UPDATE products SET title = ?, price = ?, description = ? WHERE id = ?",
        [title, Number(price), description, id]
      );
    }

    if (type === "users") {
      const { username, balance } = data;

      if (!username || balance === undefined) {
        return res.status(400).json({ error: "Missing fields" });
      }

      await db.query(
        "UPDATE users SET username = ?, balance = ? WHERE id = ?",
        [username, Number(balance), id]
      );
    }

    res.json({ message: "Updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }

});

app.post("/create-checkout-session", verify, async (req, res) => {
  console.log("User making purchase:", req.user);

  try {
    const { items, deliveryMethod, address } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items array is missing or invalid" });
    }

    const lineItems = items.map(item => ({
      price: item.priceId || item.priceid,
      quantity: parseInt(item.quantity) || 1
    }));

    if (deliveryMethod === "delivery") {
      lineItems.push({
        price: process.env.DELIVERY_PRICE_ID, 
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/products?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/products?canceled=true`,
      metadata: {
        userId: req.user.id,
        deliveryMethod: deliveryMethod || "collection",
        address: address || "N/A"
      }
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("STRIPE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/reports", verify, async (req, res) => {
  const userid = req.user.id;
  const reports = await fetchAll(appDB, `SELECT * FROM reports WHERE user_id = ?`, [userid])
  return res.json({reports}) // Returns reports to user
});

app.post("/reports", verify, async (req, res) => {
    const { title, text } = req.body;
    const userid = req.user.id;
    const sql = `INSERT INTO reports(user_id, title, text) VALUES(?, ?, ?)`;
  try {
    const note = await execute(appDB, sql, [userid, title, text]);
    res.json({note, success: true})
  } catch (err) {
    console.log(err);
    res.status(500).json({success: false, message: "Error creating reports"})
  } 
});

app.post("/contact-messages", async (req, res) => {
  const { email, text } = req.body;
  const date = new Date().toISOString(); // Generate current timestamp

  const sql = `INSERT INTO contactMessages(email, text, date) VALUES(?, ?, ?)`;
  
  try {
      await execute(appDB, sql, [email, text, date]);
      res.json({ success: true, message: "Message sent!" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error saving message" });
  } 
});

app.get("/products", async (req, res) => {
  const products = await fetchAll(appDB, "SELECT * FROM products");
  res.json(products);
});

app.post("/products", async (req, res) => {
  const { title, description, image, price, category } = req.body;

  try {

    // Product properties
    const stripeProduct = await stripe.products.create({
      name: title,
      description: description,
      images: [image],
    });

    // Create price
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: price * 100,
      currency: "gbp"
    });

    // Save to DB
    const product = await execute(
      appDB,
      `INSERT INTO products (title, description, image, price, category, productId, priceId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        image,
        price,
        category,
        stripeProduct.id,
        stripePrice.id
      ]
    );

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
    console.log(err)
  }
});

app.get("/products/:id", async (req, res) => {
  const product = await fetchOne(
    appDB,
    "SELECT * FROM products WHERE id = ?",
    [req.params.id]
  );

  res.json(product);
});
// Get products from product catalog
app.get("/stripe-products", async (req, res) => {
  try {

    const products = await stripe.products.list({ limit: 100 });
    console.log("Stripe products:", products.data);

    const prices = await stripe.prices.list({ limit: 100 });
    console.log("Stripe prices:", prices.data);

    const formattedProducts = products.data.map(product => {

      const price = prices.data.find(
        p => p.product === product.id
      );

      return {
        title: product.name,
        description: product.description,
        image: product.images?.[0] || "",
        price: price ? price.unit_amount / 100 : 0,
        productId: product.id,
        priceId: price ? price.id : null
      };
    });

    console.log("Formatted:", formattedProducts);

    res.json(formattedProducts);

  } catch (err) {
    console.error("Stripe fetch error:", err.message);
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/sync-stripe-products", async (req, res) => {
  try {

    const products = await stripe.products.list({ limit: 100, active: true });
    const prices = await stripe.prices.list({ limit: 100 });

    for (const product of products.data) {

      if (product.metadata.type === "delivery") {
        console.log("Skipping delivery fee:", product.name);
        continue;
      }

      const price = prices.data.find(
        p => p.product === product.id
      );

      const exists = await fetchAll(
        appDB,
        "SELECT * FROM products WHERE productId = ?",
        [product.id]
      );

      if (exists.length === 0) {

        await execute(
          appDB,
          `INSERT INTO products
          (title, description, image, price, category, productId, priceId)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.description,
            product.images?.[0] || "",
            price ? price.unit_amount / 100 : 0,
            "General",
            product.id,
            price ? price.id : null
          ]
        );

        console.log("Inserted:", product.name);
      }
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: err.message });
  }
});
// Forget password
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const users = await fetchAll(appDB, "SELECT * FROM users WHERE email = ?", [email]);
    if (!users.length) return res.json({ success: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 1000 * 60 * 15;

    await execute(appDB, "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?", [
      token,
      expiry,
      email,
    ]);

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"SERN Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({ success: true, message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Error sending password reset email" });
  }
});

app.use(verify);
/* JWT is valid or not
 Returns actual user as object */
app.get("/me", verify, (req, res) => {
  return res.json(req.user)
});
app.get("/me/profile", verify, async (req, res) => {
  const users = await fetchAll(appDB, `SELECT * FROM users WHERE username = ?`, [req.user.username]);
  return res.json(users[0]);
});
app.get("/me/orders", verify, async (req, res) => {
  const orders = await fetchAll(appDB, `SELECT * FROM orders WHERE user_id = ?`, [req.user.id]);
  return res.json({orders});
});

// only work for admins
app.get("/users", async (req, res) => {
    const userid = req.user.id;
    if (req.user.role !== "ADMIN") {
      return res.json({success: false})
    }
  const users = await fetchAll(appDB, `SELECT username, role FROM users`)
  return res.json({users}) // Returns reports to user
})

app.get("/contact-messages", verify, (req, res) => {

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Access denied" });
    }

    appDB.all("SELECT * FROM contactMessages", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }

        res.json(rows);
    });
});

app.put("/contact-messages/:id", verify, (req, res) => {

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Access denied" });
    }

    const id = req.params.id;
    const { email, text, date } = req.body;

    appDB.run(
        `UPDATE contactMessages 
         SET email = ?, text = ?, date = ?
         WHERE id = ?`,
        [email, text, date, id],
        function (err) {

            if (err) {
                return res.status(500).json({ error: "Update failed" });
            }

            res.json({ success: true });
        }
    );
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));