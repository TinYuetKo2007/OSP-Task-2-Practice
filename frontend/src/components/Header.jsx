import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
function Header () {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    useEffect(() => {setUsername(localStorage.getItem("username"))}, []);
    
    const handleLogout = () => {localStorage.removeItem("username");
        navigate("/login");
    }

    return (
        <div>
            <nav className="topnav">
                <div>
                <Link to={"/"}>Main Page</Link>
                <Link to={"/add-song"}>Upload Page</Link>
                <Link to={"/contact"}>Contact</Link>
                
                </div>
                 {username ? <button onClick={handleLogout}> Log Out </button> : <div>
                    <Link to={"/signup"}>Sign Up</Link>
                    <Link to={"/login"}>Log In</Link>
                </div>}
            </nav>
        </div>
    )
}
export default Header;