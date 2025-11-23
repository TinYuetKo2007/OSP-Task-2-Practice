require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();

const usersDB = require("./usersDB");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_API_KEY)
const cors = require ("cors")

app.get("/", (req, res) => res.send("Connection successful"));

app.use(bodyParser.json());
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
        res.json({ success: true, message: "Login successful", user: row.username });
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    });
  });

app.post("/create-products", async (req, res) => {
  try {
    // Product 1
    const zooTicket = await stripe.products.create({
      name: "Zoo Ticket",
      description: "One-time ticket to RZA",
    });
    const ticketPrice = await stripe.prices.create({
      product: zooTicket.id,
      unit_amount: 9900,
      currency: "gbp",
    });

    // Product 2
    const hotelBooking = await stripe.products.create({
      name: "Hotel booking",
      description: "Reserve a booking",
    });
    const hotelPrice = await stripe.prices.create({
      product: hotelBooking.id,
      unit_amount: 12900, 
      currency: "gbp",
    });

    res.json({
      success: true,
      zooTicket: { product: zooTicket, price: ticketPrice },
      hotelBooking: { product: hotelBooking, price: hotelPrice },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/create-checkout-session", async (req, res) => {
  try {
  const { priceId } = req.body;
  console.log( req.body )
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment",
    success_url: `${ process.env.CLIENT_URL }/checkout-success`,
    cancel_url: `${ process.env.CLIENT_URL }/cart`
  });
  res.redirect(session.url) // For forms with no onSubmit, takes user to payment
} catch (err) {
  res.status(500).json({ error: err.message });
}
})

app.listen(4000, () => console.log("Server running on http://localhost:4000"));