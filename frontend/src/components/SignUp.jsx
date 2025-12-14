import headphones from "../image/headphones.jpg"
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import { useState } from "react";

function SignUp() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

 const handleRegister = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setMessage("Please enter username and password.");
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem("username", username);
                setMessage("Registration successful! Redirecting...");
                setTimeout(() => navigate("/profile"), 1000);
            } else {
                setMessage(data.message || "Registration failed.");
            }
        } catch (err) {
            setMessage("Server error. Please try again later.");
        }
    };

    return (
        <div className="container">
            <Header/>
            <div className="form-container">
                    <form className="form" onSubmit={handleRegister}>
                    <h1>Sign Up</h1>
                    <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}/>

                    <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>
                    <button type="submit">Sign Up</button>
                    <p>Not a member? <Link to="/login">Log In</Link></p>
                </form>
                    <p>{message}</p>
            </div>
            <img src={headphones} />
        </div>
    )
}
export default SignUp;