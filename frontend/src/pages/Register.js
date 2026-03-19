import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("retailer"); // Default to retailer
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        // Validation
        if (!username || !password || !confirmPassword) {
            setMessage("⚠️ All fields are required");
            return;
        }

        if (password.length < 6) {
            setMessage("⚠️ Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("⚠️ Passwords do not match");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("✅ Registration successful! Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setMessage(`⚠️ ${data.message || 'Registration failed'}`);
            }
        } catch (error) {
            setMessage(`⚠️ Network error: ${error.message}`);
        } finally {
            setLoading(false);
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
            <h1 style={styles.title}>Register</h1>
            <p style={styles.subtitle}>Create your retailer account</p>

            {message && <p style={styles.message}>{message}</p>}

            <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                    disabled={loading}
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    disabled={loading}
                    minLength={6}
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                    disabled={loading}
                    minLength={6}
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={styles.input}
                    disabled={loading}
                >
                    <option value="retailer">Retailer</option>
                    <option value="manufacturer">Manufacturer</option>
                </select>
            </div>

            <button
                onClick={handleRegister}
                disabled={!username || !password || !confirmPassword || loading}
                style={styles.button}
            >
                {loading ? "⏳ Registering..." : "Register"}
            </button>

            <p style={styles.loginLink}>
                Already have an account?{" "}
                <span
                    onClick={() => navigate("/login")}
                    style={styles.link}
                >
                    Login here
                </span>
            </p>
        </div>
    );
};

// 🎨 Inline CSS styles
const styles = {
    container: {
        position: "relative",
        width: "400px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
    },
    title: {
        marginBottom: "5px",
        color: "#333",
        fontSize: "28px",
    },
    subtitle: {
        marginBottom: "20px",
        color: "#666",
        fontSize: "14px",
    },
    message: {
        color: "#e74c3c",
        fontSize: "14px",
        marginBottom: "15px",
        padding: "10px",
        borderRadius: "5px",
        backgroundColor: "#fadbd8",
    },
    formGroup: {
        textAlign: "left",
        marginBottom: "15px",
    },
    label: {
        display: "block",
        marginBottom: "5px",
        color: "#555",
        fontWeight: "bold",
        fontSize: "14px",
    },
    input: {
        width: "100%",
        padding: "12px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        outline: "none",
        fontSize: "14px",
        boxSizing: "border-box",
        transition: "border-color 0.3s",
    },
    button: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#27ae60",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        transition: "background 0.3s",
        marginTop: "10px",
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
    loginLink: {
        marginTop: "15px",
        fontSize: "14px",
        color: "#666",
    },
    link: {
        color: "#3498db",
        cursor: "pointer",
        textDecoration: "underline",
        fontWeight: "bold",
    },
};

export default Register;
