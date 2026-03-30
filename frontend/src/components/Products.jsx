import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import farm_food from "../image/farm_food.jpg";
import default_image from "../image/default_image.png";
import { useBasket } from "../BasketContext";

const Message = ({ message }) => (
  <section className="message">
    <p>{message}</p>
  </section>
);

export default function Products() {
  const { basket } = useBasket();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("http://localhost:4000/products");
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setMessage(
        "Ticket bought successfully! You will receive an email confirmation."
      );
    }
    if (query.get("canceled")) {
      setMessage("Order cancelled — continue shopping.");
    }
  }, []);

  if (message)
    return (
      <>
        <Message message={message} />
        <Link to="/products">Back to products</Link>
      </>
    );

  return (
    <div className="products-page">
      {/* Header Section */}
      <div className="header-container">
        <img src={farm_food} alt="Farm Food" className="header-image" />
        <div className="header-overlay">
          <h2>Products</h2>
        </div>
      </div>

      {/* Search */}
      <div className="container">
        <div className="product-searcher">
          <SearchBar
            data={products}
            searchKey="title"
            placeholder="Search products..."
          />
        </div>

        {/* Product Grid */}
        <div className="product-list">
          <ul className="products-grid">
            {products.map((product) => (
              <li key={product.id} className="product-item">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.image || default_image}
                    alt={product.title}
                    onError={(e) => {
                      if (e.target.src !== default_image)
                        e.target.src = default_image;
                    }}
                  />
                  <p>{product.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Basket Button */}
        <div className="basket-container">
          <button
            className="basket-button"
            onClick={() => navigate("/basket")}
          >
            View Basket ({basket.length})
          </button>
        </div>
      </div>
    </div>
  );
}