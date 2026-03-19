import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
    
            // First parse JSON from response
            const data = await response.json();
    
            if (response.ok) {
                const { token, role } = data; // Use 'data', not 'response.data'
                
                // Store token and role in localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("role", role);
    
                setMessage(`✅ Login successful! Token: ${token}`);
                navigate("/dashboard");
            } else {
                setMessage("⚠️ Login failed, check your username or password");
            }
        } catch (error) {
            setMessage(`⚠️ Try again ${error}`);
        }
    };

    return (
        <div style={styles.container}>
            <button
                onClick={() => navigate("/")}
                style={styles.homeButton}
                title="back to homepage"
            >
                <FaHome /> home
            </button>
            <h1 style={styles.title}>Login</h1>
            {message && <p style={styles.message}>{message}</p>}
            <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
            />
            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
            />
            <button onClick={handleLogin} disabled={!username || !password} style={styles.button}>
                Login
            </button>
            <p style={styles.helpText}>
                Contact admin to register new accounts
            </p>
        </div>
    );
};

// 🎨 Inline CSS styles
const styles = {
    container: {
        position: "relative",
        width: "300px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
    },
    title: {
        marginBottom: "20px",
        color: "#333",
    },
    message: {
        color: "red",
        fontSize: "14px",
        marginBottom: "10px",
    },
    input: {
        width: "90%",
        padding: "10px",
        margin: "10px 0",
        borderRadius: "5px",
        border: "1px solid #ccc",
        outline: "none",
    },
    button: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#007BFF",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "background 0.3s",
    },
    homeButton: {
        position: "absolute",
        top: "10px",
        right: "10px",
        padding: "8px 15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "14px",
        transition: "background-color 0.3s",
    },
    helpText: {
        marginTop: "15px",
        fontSize: "12px",
        color: "#999",
        fontStyle: "italic",
    },
};

export default Login;
