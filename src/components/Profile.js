import React, { useState, useEffect } from "react";
import { FaTrash, FaChartBar, FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import API from "../api";
import './Profile.css';

// A simple, reusable notification component placeholder
const Notification = ({ message, type, onClear }) => {
    if (!message) return null;
    return (
        <div className={`notification notification-${type}`}>
            <p>{message}</p>
            <button onClick={onClear}>×</button>
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
        // ✅ Replaced alert with a check and return
        if (!name || !email || !password) {
            console.error("Please fill all fields."); // Or trigger a toast notification
            return;
        }
        setIsAdding(true);
        try {
            await onAddWorker({ name, email, password });
            setName(''); setEmail(''); setPassword('');
            onClose();
        } catch (err) { /* Error is handled in parent */ } finally {
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
                    <input className="modal-input" type="email" placeholder="Worker Login Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input className="modal-input" type="password" placeholder="Initial Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <div className="modal-actions">
                        <button type="submit" className="modal-button add" disabled={isAdding}>{isAdding ? "Adding..." : "Add Worker"}</button>
                        <button type="button" className="modal-button cancel" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Profile({ user, onUpdateUser }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000); // Auto-hide after 5 seconds
    };

    const handleAddWorker = async (workerData) => {
    try {
        // The API call is now a complete statement.
        // The workerData is passed as the second argument.
        await API.post("/api/workers/add", workerData);

        // These lines will only run AFTER the API call above is successful.
        showNotification("Worker added successfully!");
        onUpdateUser(); // Refresh profile data to show the new worker

    } catch (error) {
        // This block will run if the API call fails for any reason.
        showNotification(error.response?.data?.error || "Failed to add worker.", 'error');
    }
};

    const handleRemoveWorker = async (workerId, workerName) => {
        // ✅ Replaced window.confirm with a more modern approach
        const isConfirmed = window.confirm(`Are you sure you want to remove the worker: ${workerName}? This action cannot be undone.`);
        
        if (isConfirmed) {
            try {
                await API.delete(`/api/workers/${workerId}`);
                showNotification("Worker removed successfully!");
                onUpdateUser(); // Refresh data
            } catch (error) {
                showNotification(error.response?.data?.error || "Failed to remove worker.", 'error');
            }
        }
    };
    
    // Performance view placeholder
    const handleViewPerformance = () => {
        // ✅ Replaced alert with a temporary notification
        showNotification("Worker performance view is coming soon!", "info");
    };

    useEffect(() => {
        setWorkers(user?.workers || []);
    }, [user]);

    return (
        <div className="profile-container">
            <Notification message={notification.message} type={notification.type} onClear={() => setNotification({ message: '', type: '' })} />
            <div className="profile-header">
                <h2>Manage Shop & Workers</h2>
                <button className="add-worker-button" onClick={() => setIsModalOpen(true)}><FaPlus /> Register New Worker</button>
            </div>

            <div className="profile-card">
                <h3>Worker Roster</h3>
                <div className="table-responsive">
                    <table className="workers-table">
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
                                        <button className="action-button performance-button" onClick={handleViewPerformance} title="View Performance"><FaChartBar /></button>
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



