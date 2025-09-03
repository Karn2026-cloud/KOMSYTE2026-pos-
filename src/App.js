// src/App.js (Corrected Version)

import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import API from "./api";

// Import your main components
import Home from "./components/home"; // This will be the Owner's Dashboard
import Login from "./components/Login";
import Signup from "./components/Signup";
import WorkerDashboard from "./components/WorkerDashboard"; // You'll need this file for employees

const LoadingSpinner = () => <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const validateToken = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) { setLoading(false); return; }
        try {
            const response = await API.get("/api/me");
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { validateToken(); }, [validateToken]);

    const handleAuthChange = () => { setLoading(true); validateToken(); };
    const handleLogout = () => { localStorage.removeItem("token"); setUser(null); };
    
    if (loading) { return <LoadingSpinner />; }

    // This component protects your routes and checks for the correct role
    const ProtectedRoute = ({ children, allowedRoles }) => {
        if (!user) { return <Navigate to="/login" />; }
        if (!allowedRoles.includes(user.role)) {
            const defaultPath = user.role === 'owner' ? '/dashboard' : '/worker/billing';
            return <Navigate to={defaultPath} />;
        }
        return children;
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <Login onAuthChange={handleAuthChange} /> : <Navigate to="/" />} />
                <Route path="/signup" element={!user ? <Signup onAuthChange={handleAuthChange} /> : <Navigate to="/" />} />
                
                {/* This route sends all owners to your Home component, which has the sidebar */}
                <Route
                    path="/dashboard/*" 
                    element={
                        <ProtectedRoute allowedRoles={['owner']}>
                            <Home onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />
                
                {/* This route sends all workers to their own separate dashboard */}
                <Route
                    path="/worker/*"
                    element={
                        <ProtectedRoute allowedRoles={['worker']}>
                            <WorkerDashboard user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* This route automatically redirects logged-in users to the correct place */}
                <Route
                    path="/"
                    element={ user ? <Navigate to={user.role === 'owner' ? '/dashboard' : '/worker/billing'} /> : <Navigate to="/login" /> }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;