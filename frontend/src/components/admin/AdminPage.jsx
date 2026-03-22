import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import UsersTable from "./UsersTable";
import ProductsTable from "./ProductsTable";

export default function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const fetchUser = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      return navigate("/login");
    }
    // Allows server to identify user
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/me", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      const user = await res.json();
      console.log(user.role);
      setUser(user);
      setLoading(false);
    } catch {
      setErr("Error fetching username");
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }
  if (err) {
    return <h1>{err}</h1>;
  }
  if (user.role !== "ADMIN") {
    return <h1>Not an admin: Access denied.</h1>;
  }

  return (
  <div className="admin-dashboard">
    <h1>Admin Dashboard</h1>

    <div className="admin-layout">
      
      <div className="admin-section">
        <div className="admin-header">
          <h3>List of Users</h3>
          <button className="edit-btn" onClick={() => navigate("/admin/edit/users")}>Edit</button>
        </div>
        <UsersTable />
      </div>

      <div className="admin-section">
        <div className="admin-header">
          <h3>List of Products</h3>
          <button className="edit-btn" onClick={() => navigate("/admin/edit/products")}>Edit</button>
        </div>
        <ProductsTable />
      </div>

    </div>

    <button 
      className="report-btn"
      onClick={() => navigate("add-product")}
    >
      Add Product
    </button>
        <button 
      className="report-btn"
    >
      Create report
    </button>
  </div>
);
}
