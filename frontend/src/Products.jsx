import { useState, useEffect } from "react";
import Header from "./components/Header.jsx"
import ProductDisplay from "./components/ProductDisplay.jsx";
import { Link } from "react-router-dom"
const products = [
    {
        name: "Zoo Ticket",
        priceId: "price_1SW0yGCZTWpALhZBIDwcknTN",
    },
    {
        name: "Hotel Booking 1 Night",
        priceId: "price_1SW0z7CZTWpALhZBkD8FKV5z",
    },
];

const Message = ({ message }) => (
  <section>
    <p>{message}</p>
  </section>
);

export default function Products() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage("Ticket bought successfully! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      setMessage(
        "Order cancelled -- continue to shop around and checkout when you're ready."
      );
    }
  }, []);

  return message ? (
    <>
    <Header/>
    <Message message={message} />
    <Link onClick={() => window.location.href="/products"}>s</Link>
    </>
    
  ) : (
    <>
    <Header/>
            {products.map((product) => (
                    <ProductDisplay key={product.name} name={product.name} priceId={product.priceId} />
            ))}
        </>
  );
}