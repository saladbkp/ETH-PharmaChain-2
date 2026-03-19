import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Welcome to Pharma Chain</h1>
            <p style={styles.subtitle}>Secure your pharmaceuticals with blockchain verification.</p>
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
