import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";

const Message = ({ message }) => (
  <section>
    <p>{message}</p>
  </section>
);

export default function Products() {
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
  async function loadProducts() {
    try {
      const res = await fetch("http://localhost:4000/products");
      const data = await res.json();

      console.log("Products:", data);

      if (Array.isArray(data)) {
        setProducts(data);
      }

    } catch (err) {
      console.error(err);
    }
  }

  loadProducts();
}, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage("Ticket bought successfully! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      setMessage("Order cancelled — continue shopping.");
    }
  }, []);

  return message ? (
    <>
      <Message message={message} />
      <Link to="/products">Back to products</Link>
    </>
  ) : (
    <div className="products-page">
      <div className="container">
        <div className="product-searcher">
          <SearchBar
            data={products}
            searchKey="title"
            placeholder="Search products..."
          />
        </div>

        <div className="product-list">
          <h1>Products</h1>

          <ul className="products-grid">
            {products.map((product) => (
              <li key={product.id}>
                <Link to={`/products/${product.id}`}>
                  <img src={product.image} alt={product.title} />
                  <p>{product.title}</p>
                </Link>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </div>
  );
}