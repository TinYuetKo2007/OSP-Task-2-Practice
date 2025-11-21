import Header from "./Header";
import { useEffect, useState } from "react";
import List from "../List.jsx"
import { Navigate } from "react-router-dom";
function Profile () {
    const [username, setUsername] = useState(localStorage.getItem("username"));
    useEffect(() => {setUsername(localStorage.getItem("username"))}, []);
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