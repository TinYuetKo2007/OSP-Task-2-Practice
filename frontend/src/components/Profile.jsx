import Header from "./Header";
import { useEffect, useState } from "react";
import List from "../List.jsx"
import { Navigate } from "react-router-dom";
function Profile () {
    const [username, setUsername] = useState(localStorage.getItem("username"));
    const fetchUser = async () => {
        // Allows server to identify user
        const res = await fetch("http://localhost:4000/me", {method: "GET", headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }});
        const data = await res.json()
        setUsername(data.username)
    };
    
useEffect(() => {fetchUser()}, []);
    if (!username) {
        return (<Navigate to="/signup"/>)
    }
    return (
        <div>
            <Header/>
            <h1>Welcome, {username}!</h1>
            <List/>
        </div>
    )
}

export default Profile;