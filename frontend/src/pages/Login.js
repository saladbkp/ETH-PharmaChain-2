import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage("⚠️ Login failed, check your username or password");
                setLoading(false);
                return;
            }

            const { token, role } = data;
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            setMessage("✅ Login successful!");

            // Redirect to role's default page
            setTimeout(() => {
                switch(role) {
                    case 'admin':
                        navigate("/dashboard/admin/pending-medicines");
                        break;
                    case 'manufacturer':
                        navigate("/dashboard/manufacturer/register");
                        break;
                    case 'retailer':
                        navigate("/dashboard/inventory");
                        break;
                    default:
                        navigate("/dashboard");
                }
            }, 500);

        } catch (error) {
            setMessage(`⚠️ Error: ${error.message}`);
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
            <h1 style={styles.title}>Login</h1>
            {message && (
                <div style={{
                    ...styles.message,
                    whiteSpace: 'pre-line',
                    backgroundColor: message.includes('✅') ? '#d4edda' : message.includes('⚠️') ? '#f8d7da' : '#fff3cd',
                    color: message.includes('✅') ? '#155724' : message.includes('⚠️') ? '#721c24' : '#856404',
                    padding: '12px',
                    borderRadius: '5px',
                    marginBottom: '15px'
                }}>
                    {message}
                </div>
            )}
            <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                disabled={loading}
            />
            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                disabled={loading}
            />
            <button
                onClick={handleLogin}
                disabled={!username || !password || loading}
                style={{
                    ...styles.button,
                    backgroundColor: loading ? '#6c757d' : '#007BFF',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? '🔄 Logging in...' : 'Login'}
            </button>
            <p style={styles.helpText}>
                Contact admin to register new accounts
            </p>
            <div style={styles.walletInfo}>
                <strong>💡 Note:</strong>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Your wallet will be automatically connected after successful login.
                    Make sure MetaMask is installed and unlocked.
                </p>
            </div>
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
    walletInfo: {
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "5px",
        border: "1px solid #dee2e6",
        fontSize: "12px",
        textAlign: "left",
    },
    walletList: {
        marginTop: "10px",
    },
    walletItem: {
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
        borderBottom: "1px solid #e9ecef",
    },
    roleLabel: {
        fontWeight: "bold",
        color: "#495057",
    },
    address: {
        fontFamily: "monospace",
        color: "#6c757d",
    },
};

export default Login;
