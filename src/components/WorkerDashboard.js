// src/components/WorkerDashboard.js (NEW FILE)

import React, { useState } from 'react';
import Billing from "./Billing";
import StockList from "./stock";
import './WorkerDashboard.css';
import komsyteLogo from '../assets/komsyte-logo.jpg';
import { FaBars } from 'react-icons/fa';

const MENU_ITEMS = {
    billing: 'Billing',
    stock: 'Stock List',
};

const WorkerDashboard = ({ user, onLogout }) => {
    const [activeMenu, setActiveMenu] = useState('billing');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleMenuClick = (menuKey) => {
        setActiveMenu(menuKey);
        setSidebarOpen(false);
    };

    return (
        <div className="home-container">
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
            
            <nav className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
                <div className="sidebar-logo">
                    <img src={komsyteLogo} alt="KOMSYTE Logo" />
                    <h3>Employee Portal</h3>
                </div>
                <ul className="menu-list">
                    {Object.entries(MENU_ITEMS).map(([key, value]) => (
                        <li key={key} className="menu-item">
                            <button
                                className={`menu-button ${activeMenu === key ? 'active' : ''}`}
                                onClick={() => handleMenuClick(key)}
                            >
                                {value}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="main-content-wrapper">
                <header className="main-header">
                    <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
                        <FaBars />
                    </button>
                    <h2 className="header-title">{MENU_ITEMS[activeMenu]}</h2>
                    <div className="header-user-info">
                        <span>Welcome, <strong>{user?.user?.name || 'Employee'}</strong></span>
                        <button className="logout-button-header" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className="main-content">
                    {/* Note: We are not passing the 'user' prop to these components
                        because the worker versions do not need subscription data. */}
                    {activeMenu === 'billing' && <Billing />}
                    {activeMenu === 'stock' && <StockList />}
                </main>
            </div>
        </div>
    );
};

export default WorkerDashboard;