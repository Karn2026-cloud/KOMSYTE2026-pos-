// src/components/home.js (Corrected Version)

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from "react-router-dom";
import API from '../api';
import './Home.css';

import Profile from './Profile';
import Billing from './Billing';
import StockList from './stock';
import RegisterProduct from './register';
import Reports from './report';
import Subscription from './subscription';

import komsyteLogo from '../assets/komsyte-logo.jpg';
import { FaBars } from 'react-icons/fa';

const MENU_ITEMS = {
    profile: 'Profile & Workers',
    billing: 'Billing',
    stock: 'Stock List',
    register: 'Register Product',
    reports: 'Reports',
    subscription: 'Subscription',
};

export default function Home({ onLogout }) {
    const [profileData, setProfileData] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const fetchProfileData = useCallback(async () => {
        try {
            const response = await API.get('/api/profile');
            setProfileData(response.data);
        } catch (error) {
            console.error("Failed to fetch owner profile data:", error);
        }
    }, []);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const getActiveMenuKey = () => {
        const path = location.pathname.split('/dashboard/')[1] || 'profile';
        return MENU_ITEMS[path] ? path : 'profile';
    };

    return (
        <div className="home-container">
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
            
            <nav className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
                <div className="sidebar-logo">
                    <img src={komsyteLogo} alt="KOMSYTE Logo" />
                </div>
                <ul className="menu-list">
                    {Object.entries(MENU_ITEMS).map(([key, value]) => (
                        <li key={key} className="menu-item">
                            <Link to={`/dashboard/${key}`} className={`menu-button ${getActiveMenuKey() === key ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                                {value}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="main-content-wrapper">
                <header className="main-header">
                    <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
                        <FaBars />
                    </button>
                    <h2 className="header-title">{MENU_ITEMS[getActiveMenuKey()]}</h2>
                    <div className="header-user-info">
                        <span>Welcome, <strong>{profileData?.shop?.shopName || 'Owner'}</strong></span>
                        <button className="logout-button-header" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className="main-content">
                    <Routes>
                        <Route path="profile" element={<Profile user={profileData} onUpdateUser={fetchProfileData} />} />
                        <Route path="billing" element={<Billing user={profileData} />} />
                        <Route path="stock" element={<StockList user={profileData} />} />
                        <Route path="register" element={<RegisterProduct user={profileData} />} />
                        <Route path="reports" element={<Reports user={profileData} />} />
                        <Route path="subscription" element={<Subscription user={profileData} onSubscriptionUpdate={fetchProfileData} />} />
                        <Route index element={<Profile user={profileData} onUpdateUser={fetchProfileData} />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}