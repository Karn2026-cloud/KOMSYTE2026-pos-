import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignUp.css"; // Import the stylesheet

// --- API Abstraction ---
const signupUser = async (userData) => {
  const response = await fetch("http://localhost:5000/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "An unknown error occurred.");
  }

  return data;
};

// --- Component ---
function Signup({ onAuthChange }) {
  const [formData, setFormData] = useState({
    shopName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token } = await signupUser(formData);
      localStorage.setItem("token", token);
      if (onAuthChange) onAuthChange();
      navigate("/");
    } catch (err) {
      setError(err.message || "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Create Account</h2>
      <form onSubmit={handleSignup}>
        <div className="input-group">
          <label htmlFor="shopName" className="input-label">Shop Name</label>
          <input
            id="shopName"
            name="shopName"
            type="text"
            placeholder="Shop Name"
            value={formData.shopName}
            onChange={handleChange}
            required
            autoComplete="organization"
            className="signup-input"
          />
        </div>
        <div className="input-group">
          <label htmlFor="email" className="input-label">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="signup-input"
          />
        </div>
        <div className="input-group">
          <label htmlFor="password" className="input-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
            className="signup-input"
          />
        </div>
        <button type="submit" disabled={loading} className="signup-button">
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <p className="footer-text">
        Already have an account?{" "}
        <Link to="/login" className="signup-link">
          Login here
        </Link>
      </p>
    </div>
  );
}

export default Signup;