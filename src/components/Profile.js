import React, { useState, useEffect } from "react";
import { FaTrash, FaChartBar, FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import API from "../api";
import './Profile.css'; // Make sure you have created and styled this file

// A simple, reusable notification component. You can style this further in Profile.css
const Notification = ({ message, type, onClear }) => {
    if (!message) return null;

    const notificationStyle = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        backgroundColor: type === 'error' ? '#e74c3c' : '#2ecc71',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    };

    return (
        <div style={notificationStyle}>
            {message}
            <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem', padding: '0', lineHeight: '1' }}>
                &times;
            </button>
        </div>
    );
};

const AddWorkerModal = ({ isOpen, onClose, onAddWorker }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            // This can be improved to use the notification system from the parent
            return alert("Please fill all fields.");
        }
        setIsAdding(true);
        try {
            await onAddWorker({ name, email, password });
            setName(''); setEmail(''); setPassword('');
            onClose();
        } catch (err) {
            // Error is handled in the parent component's onAddWorker function
        } finally {
            setIsAdding(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className="modal-title">Register New Worker</h3>
                <form onSubmit={handleSubmit}>
                    <input className="modal-input" type="text" placeholder="Worker Full Name" value={name} onChange={e => setName(e.target.value)} required />
                    <input className="modal-input" type="email" placeholder="Worker Email (for login)" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input className="modal-input" type="password" placeholder="Create a Temporary Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <div className="modal-actions">
                        <button type="button" className="modal-close-button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-add-button" disabled={isAdding}>{isAdding ? "Adding..." : "Add Worker"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Profile({ user, onUpdateUser }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ shopName: '', email: '' });
    const [isSaving, setIsSaving] = useState(false);

    // ✅ 1. ADD NOTIFICATION STATE
    const [notification, setNotification] = useState({ message: '', type: '' });

    // ✅ 2. DEFINE THE NOTIFICATION FUNCTION
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        // Auto-hide the notification after 5 seconds
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    useEffect(() => {
        if (user?.shop) {
            setFormData({
                shopName: user.shop.shopName,
                email: user.shop.email,
            });
        }
    }, [user]);

    const handleAddWorker = async (workerData) => {
        try {
            await API.post("/api/workers/add", workerData);
            await onUpdateUser();
            showNotification("Worker added successfully!"); // This will now work
        } catch (err) {
            showNotification(err.response?.data?.error || "Failed to add worker.", 'error'); // This will now work
            throw err; // Re-throw error so the modal knows the submission failed
        }
    };

    const handleRemoveWorker = async (workerId, workerName) => {
        if (window.confirm(`Are you sure you want to remove the worker "${workerName}"?`)) {
            try {
                await API.delete(`/api/workers/${workerId}`);
                await onUpdateUser();
                showNotification("Worker removed successfully!"); // Replaced alert
            } catch (err) {
                showNotification(err.response?.data?.error || "Failed to remove worker.", 'error'); // Replaced alert
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSubmit = async () => {
        if (!formData.shopName || !formData.email) {
            return showNotification("Shop Name and Email cannot be empty.", 'error'); // Replaced alert
        }
        setIsSaving(true);
        try {
            await API.put('/api/profile/shop', formData);
            await onUpdateUser();
            setIsEditing(false);
            showNotification("Shop information updated successfully!");
        } catch (err) {
            showNotification(err.response?.data?.error || "Failed to update profile.", 'error'); // Replaced alert
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return <p className="loading-message">Loading Profile...</p>;
    }

    const { shop, subscription, workers } = user;

    return (
        <div className="profile-container">
            {/* ✅ 3. RENDER THE NOTIFICATION COMPONENT */}
            <Notification
                message={notification.message}
                type={notification.type}
                onClear={() => setNotification({ message: '', type: '' })}
            />

            <div className="info-grid">
                <div className="card">
                    <div className="profile-header">
                        <h3 className="card-title">Shop Information</h3>
                        {!isEditing ? (
                            <button className="action-button edit-button" onClick={() => setIsEditing(true)}> <FaEdit /> Edit </button>
                        ) : (
                            <div className="edit-actions">
                                <button className="action-button cancel-button" onClick={() => setIsEditing(false)} disabled={isSaving}> <FaTimes /> Cancel </button>
                                <button className="action-button save-button" onClick={handleSaveSubmit} disabled={isSaving}> <FaSave /> {isSaving ? 'Saving...' : 'Save'} </button>
                            </div>
                        )}
                    </div>
                    {!isEditing ? (
                        <>
                            <p className="item"><strong>Shop Name:</strong> {shop?.shopName || "-"}</p>
                            <p className="item"><strong>Email:</strong> {shop?.email || "-"}</p>
                        </>
                    ) : (
                        <div className="edit-form">
                            <label className="form-label">Shop Name:</label>
                            <input className="modal-input" type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} />
                            <label className="form-label">Login Email:</label>
                            <input className="modal-input" type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                    )}
                </div>
                <div className="card">
                    <h3 className="card-title">Subscription</h3>
                    <p className="item"><strong>Plan:</strong> {subscription?.plan || "Free"}</p>
                    <p className="item"><strong>Status:</strong> {subscription?.status || "Inactive"}</p>
                    <button className="upgrade-button" onClick={() => showNotification('Upgrade functionality coming soon!', 'info')}> Manage Subscription </button>
                </div>
            </div>
            <div className="card">
                <div className="profile-header">
                    <h3 className="card-title">Manage Workers</h3>
                    <button className="add-new-button" onClick={() => setIsModalOpen(true)}>
                        <FaPlus style={{ marginRight: '8px' }} /> Register Worker
                    </button>
                </div>
                <div className="table-container">
                    <table className="worker-table">
                        <thead>
                            <tr>
                                <th className="th">Name</th>
                                <th className="th">Login Email</th>
                                <th className="th">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers?.length > 0 ? workers.map(w => (
                                <tr key={w._id}>
                                    <td className="td">{w.name}</td>
                                    <td className="td">{w.email}</td>
                                    <td className="td">
                                        <button className="action-button performance-button" onClick={() => showNotification('Performance view coming soon!', 'info')} title="View Performance"><FaChartBar /></button>
                                        <button className="action-button remove-button" onClick={() => handleRemoveWorker(w._id, w.name)} title="Remove Worker"><FaTrash /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" className="td no-workers-message">No workers registered yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddWorkerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddWorker={handleAddWorker} />
        </div>
    );
}
