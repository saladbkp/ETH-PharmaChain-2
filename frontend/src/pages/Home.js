import { Link } from "react-router-dom";
import { useState } from "react";

const Home = () => {
    const [connectionStatus, setConnectionStatus] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    const ADMIN_ADDRESS = "0x00F8DB8eFf135b324564aE33295513F5Dc7091cD";

    const connectMetaMask = async () => {
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                const error = "❌ MetaMask not installed";
                setConnectionStatus(error);
                console.error(error);
                alert("Please install MetaMask from https://metamask.io");
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                const error = "❌ No accounts found";
                setConnectionStatus(error);
                console.error(error);
                return;
            }

            const connectedAccount = accounts[0];

            // Check if it's admin account
            if (connectedAccount.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
                setConnectionStatus("✅ YES");
                setIsAdmin(true);
                console.log("✅ Admin account connected:", connectedAccount);
            } else {
                const error = `❌ Wrong account. Expected admin: ${ADMIN_ADDRESS}`;
                setConnectionStatus(error);
                console.error(error);
                console.error("Connected account:", connectedAccount);
                setIsAdmin(false);
            }

        } catch (error) {
            const errorMsg = `❌ Error: ${error.message}`;
            setConnectionStatus(errorMsg);
            console.error("MetaMask connection error:", error);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Welcome to Pharma Chain</h1>
            <p style={styles.subtitle}>Secure your pharmaceuticals with blockchain verification.</p>

            {/* MetaMask Connect Button */}
            <div style={styles.metaMaskSection}>
                <button
                    onClick={connectMetaMask}
                    style={styles.connectButton}
                >
                    🔗 Connect MetaMask (Admin)
                </button>
                {connectionStatus && (
                    <div style={{
                        ...styles.statusMessage,
                        color: isAdmin ? '#28a745' : '#dc3545'
                    }}>
                        {connectionStatus}
                    </div>
                )}
            </div>

            <nav style={styles.nav}>
                <Link to="/login" style={styles.button}>Login</Link>
                <Link to="/scan" style={styles.button}>Scan Product</Link>
            </nav>
        </div>
    );
};

// 🎨 Inline CSS styles
const styles = {
    container: {
        textAlign: "center",
        padding: "50px",
        fontFamily: "Arial, sans-serif",
    },
    title: {
        fontSize: "28px",
        color: "#333",
        marginBottom: "10px",
    },
    subtitle: {
        fontSize: "16px",
        color: "#555",
        marginBottom: "20px",
    },
    metaMaskSection: {
        margin: "30px 0",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "10px",
        border: "1px solid #dee2e6",
    },
    connectButton: {
        backgroundColor: "#f6851b",
        color: "white",
        border: "none",
        padding: "15px 30px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.3s",
        marginBottom: "15px",
    },
    statusMessage: {
        marginTop: "10px",
        padding: "10px",
        borderRadius: "5px",
        fontWeight: "bold",
        fontSize: "14px",
    },
    nav: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
    },
    button: {
        textDecoration: "none",
        backgroundColor: "#007BFF",
        color: "white",
        padding: "10px 20px",
        borderRadius: "5px",
        transition: "background 0.3s",
        fontSize: "16px",
    },
};

export default Home;
