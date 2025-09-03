import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from '../api'; // ✅ Switched to central API service
import "./SignUp.css";

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
      // ✅ Using relative path through the API service
      const response = await API.post("/api/signup", formData);
      const { token } = response.data;
      localStorage.setItem("token", token);
      
      if (typeof onAuthChange === 'function') {
        onAuthChange();
      }
      
      navigate("/");

    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Create Your Shop Account</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <div className="input-group">
          <label htmlFor="shopName" className="input-label">Shop Name</label>
          <input
            id="shopName"
            name="shopName"
            type="text"
            placeholder="Your Shop's Name"
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
