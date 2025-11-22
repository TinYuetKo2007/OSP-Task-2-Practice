import headphones from "../image/headphones.jpg"
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import React, { useState } from "react";

function SignUp() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( username, password ),
        });
        const data = await res.json();
        if (data.success) {
            setMessage("Registration successful! Redirecting...");
            setTimeout(() => navigate("/profile"), 1000);
            localStorage.setItem('username', username);
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div className="container">
            <Header/>
            <div className="form-container">
                    <form className="form" onSubmit={handleRegister}>
                    <h2>Harmoniq</h2>
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