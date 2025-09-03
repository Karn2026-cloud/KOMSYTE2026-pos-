import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api"; // Assuming you have a configured API client

// --- Component ---
function Login({ onAuthChange }) {
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [role, setRole] = useState("owner"); // For UI display purposes
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 🛠️ MODIFIED: The login logic is updated to match the new backend
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // We only need to send email and password.
            // The backend will figure out the role automatically.
            const response = await API.post("/api/login", formData);
            const { token, user } = response.data; // The backend now returns the user object

            // 1. Save both the token and the user info
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // 2. Notify the parent component that authentication state has changed.
            if (onAuthChange) onAuthChange(user);

            // 3. Redirect based on the role we received from the backend
            if (user.role === 'owner') {
                navigate('/dashboard');
            } else if (user.role === 'worker') {
                navigate('/worker/billing'); // Default page for workers
            }

        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Login</h2>
            <form onSubmit={handleLogin}>
                {/* This role selector is now just for the UI */}
                <div style={styles.roleSelector}>
                    <button
                        type="button"
                        style={styles.roleButton(role === "owner")}
                        onClick={() => setRole("owner")}
                    >
                        Owner
                    </button>
                    <button
                        type="button"
                        style={styles.roleButton(role === "worker")}
                        onClick={() => setRole("worker")}
                    >
                        Employee
                    </button>
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="username"
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        style={styles.input}
                    />
                </div>
                <button type="submit" disabled={loading} style={styles.button(loading)}>
                    {loading ? "Logging in..." : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                </button>
            </form>

            {error && <p style={styles.errorText}>{error}</p>}

            <p style={styles.footerText}>
                Don’t have an account?{" "}
                <Link to="/signup" style={styles.link}>
                    Sign up here
                </Link>
            </p>
        </div>
    );
}

// --- Styles ---
// (Your styles remain exactly the same, no changes needed here)
const styles = {
    container: {
        maxWidth: 400,
        margin: "50px auto",
        padding: "20px 30px",
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    },
    title: {
        textAlign: "center",
        marginBottom: 20,
    },
    roleSelector: {
        display: "flex",
        marginBottom: 20,
        border: "1px solid #ddd",
        borderRadius: 6,
        overflow: "hidden",
    },
    roleButton: (isActive) => ({
        flex: 1,
        padding: "10px 0",
        border: "none",
        background: isActive ? "#007bff" : "#f8f9fa",
        color: isActive ? "white" : "#333",
        fontSize: 16,
        cursor: "pointer",
        transition: "background 0.2s, color 0.2s",
    }),
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
    },
    input: {
        width: "100%",
        padding: 12,
        boxSizing: 'border-box',
        border: '1px solid #ccc',
        borderRadius: 4,
    },
    button: (loading) => ({
        width: "100%",
        padding: 12,
        backgroundColor: loading ? "#6c757d" : "#007bff",
        color: "white",
        fontSize: 16,
        border: "none",
        borderRadius: 4,
        cursor: loading ? "not-allowed" : "pointer",
    }),
    errorText: {
        color: "#dc3545",
        marginTop: 10,
        fontWeight: "bold",
        textAlign: "center",
    },
    footerText: {
        marginTop: 15,
        textAlign: "center",
    },
    link: {
        color: "#007bff",
        textDecoration: "none",
    },
};

export default Login;