require("dotenv").config();
const jwt =  require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();

const usersDB = require("./usersDB");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_API_KEY)
const cors = require ("cors");
const { verify } = require("./verify");

app.get("/", (req, res) => res.send("Connection successful"));

// Middleware looks at code before request is sent to server
app.use(bodyParser.json());
// converts body into object

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));
app.use(express.urlencoded({ extended: true }));
// REGISTER NEW USER

app.post("/signup", async (req, res) => {
    const {username, password} = req.body;
    try {
        const hash = await bcrypt.hash(password, 10)
        usersDB.run(`INSERT INTO users (username, password) VALUES (?,?)`, [username, hash], function (err) {
            if (err)
                return res.status(400).json({success: false, message: err.message})
            res.json({success: true})
        });
    } catch (err) {
        res.status(500).json({success: false, message: "Registration failed"})
    }
});
/* JWT is valid or not
 Returns actual user as object */
app.get("/me", verify, (req, res) => {
  return res.json(req.user)
});

//LOGIN USER
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    console.log(username, password)
    usersDB.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (!row)
        return res.status(401).json({ success: false, message: "User not found" });
  
      // Compare passwords
      const match = await bcrypt.compare(password, row.password);
      if (match) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_LIFETIME
        });
        res.json({ success: true, message: "Login successful", token });
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    });
  });

app.post("/create-checkout-session", async (req, res) => {
  try {
  const { priceId } = req.body;
  console.log( req.body )
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment",
    success_url: `${ process.env.CLIENT_URL }/products?success=true`,
    cancel_url: `${ process.env.CLIENT_URL }/products?canceled=true`
  });
  res.redirect(session.url) // For forms with no onSubmit, takes user to payment
} catch (err) {
  res.status(500).json({ error: err.message });
}
})

app.listen(4000, () => console.log("Server running on http://localhost:4000"));