import React, { useState, useEffect } from "react";
import { FaTrash, FaChartBar, FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import API from "../api";
import styled, { keyframes } from 'styled-components';

// ==========================================================================
//   STYLED COMPONENTS (CSS is now part of your component file)
// ==========================================================================

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ProfileContainer = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 15px;
  animation: ${fadeIn} 0.5s ease-in-out;
  @media (min-width: 768px) {
    padding: 25px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 20px;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 6px 25px rgba(44, 62, 80, 0.08);
  display: flex;
  flex-direction: column;
  @media (min-width: 768px) {
    padding: 25px;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 15px;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
`;

const Item = styled.p`
  font-size: 1rem;
  color: #555;
  margin: 12px 0;
  line-height: 1.5;
  strong {
    color: #2c3e50;
  }
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
`;

const UpgradeButton = styled(Button)`
  background: #3498db;
  color: white;
  margin-top: auto;
  &:hover {
    background: #2980b9;
  }
`;

const AddNewButton = styled(Button)`
  background: #2ecc71;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover {
    background: #27ae60;
  }
`;

const ActionButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.1rem;
  margin: 0 5px;
  padding: 5px;
  transition: transform 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  &:hover { transform: scale(1.2); }
  &:disabled {
    color: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
  span {
    margin-left: 6px;
    font-size: 0.9rem;
    font-weight: 600;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const WorkerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  th, td {
    padding: 12px 15px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid #e9ecef;
  }
  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.4s ease;
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 25px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 1rem;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const ModalButton = styled(Button)`
  color: white;
  background: ${props => props.primary ? '#27ae60' : '#95a5a6'};
  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#2ecc71' : '#7f8c8d'};
  }
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;


// ==========================================================================
//   MODAL COMPONENT
// ==========================================================================
const AddWorkerModal = ({ isOpen, onClose, onAddWorker }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) return alert("Please fill all fields.");
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
        <ModalOverlay>
            <ModalContent>
                <ModalTitle>Register New Worker</ModalTitle>
                <form onSubmit={handleSubmit}>
                    <ModalInput type="text" placeholder="Worker Full Name" value={name} onChange={e => setName(e.target.value)} required />
                    <ModalInput type="email" placeholder="Worker Email (for login)" value={email} onChange={e => setEmail(e.target.value)} required />
                    <ModalInput type="password" placeholder="Create a Temporary Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <ModalActions>
                        <ModalButton type="button" onClick={onClose}>Cancel</ModalButton>
                        <ModalButton type="submit" primary disabled={isAdding}>{isAdding ? "Adding..." : "Add Worker"}</ModalButton>
                    </ModalActions>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
};


// ==========================================================================
//   MAIN PROFILE COMPONENT
// ==========================================================================
export default function Profile({ user, onUpdateUser }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ shopName: '', email: '' });
    const [isSaving, setIsSaving] = useState(false);

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
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add worker.");
            throw err;
        }
    };

    const handleRemoveWorker = async (workerId, workerName) => {
        if (window.confirm(`Are you sure you want to remove the worker "${workerName}"?`)) {
            try {
                await API.delete(`/api/workers/${workerId}`);
                await onUpdateUser();
            } catch (err) {
                alert(err.response?.data?.error || "Failed to remove worker.");
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSubmit = async () => {
        if (!formData.shopName || !formData.email) {
            return alert("Shop Name and Email cannot be empty.");
        }
        setIsSaving(true);
        try {
            await API.put('/api/profile/shop', formData);
            await onUpdateUser();
            setIsEditing(false);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return <p>Loading Profile...</p>;
    }

    const { shop, subscription, workers } = user;

    return (
        <ProfileContainer>
            <InfoGrid>
                <Card>
                    <ProfileHeader>
                        <CardTitle>Shop Information</CardTitle>
                        {!isEditing ? (
                            <ActionButton onClick={() => setIsEditing(true)} style={{ color: '#3498db' }}> <FaEdit /> <span>Edit</span> </ActionButton>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <ActionButton onClick={() => setIsEditing(false)} disabled={isSaving} style={{ color: '#95a5a6' }}> <FaTimes /> <span>Cancel</span> </ActionButton>
                                <ActionButton onClick={handleSaveSubmit} disabled={isSaving} style={{ color: '#27ae60' }}> <FaSave /> <span>{isSaving ? 'Saving...' : 'Save'}</span> </ActionButton>
                            </div>
                        )}
                    </ProfileHeader>
                    {!isEditing ? (
                        <>
                            <Item><strong>Shop Name:</strong> {shop?.shopName || "-"}</Item>
                            <Item><strong>Email:</strong> {shop?.email || "-"}</Item>
                        </>
                    ) : (
                        <div>
                            <label>Shop Name:</label>
                            <ModalInput type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} />
                            <label>Login Email:</label>
                            <ModalInput type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                    )}
                </Card>
                <Card>
                    <CardTitle>Subscription</CardTitle>
                    <Item><strong>Plan:</strong> {subscription?.plan || "Free"}</Item>
                    <Item><strong>Status:</strong> {subscription?.status || "Inactive"}</Item>
                    <UpgradeButton onClick={() => alert('Upgrade functionality coming soon!')}> Manage Subscription </UpgradeButton>
                </Card>
            </InfoGrid>
            <Card>
                <ProfileHeader>
                    <CardTitle>Manage Workers</CardTitle>
                    <AddNewButton onClick={() => setIsModalOpen(true)}>
                        <FaPlus /> Register Worker
                    </AddNewButton>
                </ProfileHeader>
                <TableContainer>
                    <WorkerTable>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Login Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers?.length > 0 ? workers.map(w => (
                                <tr key={w._id}>
                                    <td>{w.name}</td>
                                    <td>{w.email}</td>
                                    <td>
                                        <ActionButton onClick={() => alert('Performance view coming soon!')} title="View Performance" style={{ color: '#3498db' }}><FaChartBar /></ActionButton>
                                        <ActionButton onClick={() => handleRemoveWorker(w._id, w.name)} title="Remove Worker" style={{ color: '#e74c3c' }}><FaTrash /></ActionButton>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" style={{ textAlign: 'center', color: '#777', padding: '30px' }}>No workers registered yet.</td></tr>
                            )}
                        </tbody>
                    </WorkerTable>
                </TableContainer>
            </Card>
            <AddWorkerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddWorker={handleAddWorker} />
        </ProfileContainer>
    );
}
