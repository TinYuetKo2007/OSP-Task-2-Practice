import Header from "./Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
export default function Profile () {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [forename, setForename] = useState("");

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null)
    const fetchUser = useCallback(async () => {
        if (!localStorage.getItem("token")) {
        return (navigate("/login"))
    }
        // Allows server to identify user
        try {
            setLoading(true)
        const res = await fetch("http://localhost:4000/me/profile", {method: "GET", headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }});
        const data = await res.json()
        setEmail(data.email)
        setForename(data.forename)
        setLoading(false)
        } catch {
            setErr("Error fetching username")
            setLoading(false)}
        
    }, [navigate]);

    useEffect(() => {fetchUser()}, [fetchUser]);
    if (loading) {
        return (<div>
            <h1>Loading...</h1>
            </div>)
    }
    if (err) {
        return (<h1>{err}</h1>)
    }

    return (
        <div>
            <h1>Welcome, {forename}!</h1>
            <h2>{email}</h2>
            <h2>Recent purchases:</h2>
        </div>
    )
}