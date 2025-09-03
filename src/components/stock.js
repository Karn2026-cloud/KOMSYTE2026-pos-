// src/components/stock.js (Fully Updated and Corrected)

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import API from '../api';
import './Stock.css';

// The 'user' prop is now optional. This is crucial for the fix.
export default function StockList({ user }) {
  const planFeatures = {
    free: { updateQuantity: false, lowStockAlert: false },
    '299': { updateQuantity: true, lowStockAlert: false },
    '699': { updateQuantity: true, lowStockAlert: true },
    '1499': { updateQuantity: true, lowStockAlert: true },
  };

  // ✅ FIXED: Use optional chaining (?.) to safely access the subscription plan.
  // This prevents the app from crashing if 'user' or 'user.subscription' is not present.
  const features = planFeatures[user?.subscription?.plan] || planFeatures.free;

  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const LOW_STOCK_THRESHOLD = 10;

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/stock');
      setStockItems(response.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stock');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return stockItems;
    const term = searchTerm.toLowerCase();
    return stockItems.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.barcode.toLowerCase().includes(term)
    );
  }, [stockItems, searchTerm]);
  
  const lowStockItems = useMemo(() => {
      if (!features.lowStockAlert) return [];
      return stockItems.filter(item => item.quantity > 0 && item.quantity <= LOW_STOCK_THRESHOLD);
  }, [stockItems, features.lowStockAlert]);

  const handleRestock = async (product) => {
    if (!features.updateQuantity) {
      return alert('Updating stock quantity is a premium feature. Please upgrade your plan.');
    }
    const quantityToAdd = prompt(`How many units of "${product.name}" are you adding?`, "1");
    if (quantityToAdd === null || isNaN(quantityToAdd) || Number(quantityToAdd) <= 0) {
      return;
    }
    try {
      await API.post('/api/products', {
        barcode: product.barcode,
        quantity: Number(quantityToAdd),
        updateStock: true
      });
      fetchStock();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to restock item.');
    }
  };
  
  const handleDelete = async (productId) => {
      if(window.confirm("Are you sure you want to permanently delete this product?")) {
          try {
              await API.delete(`/api/stock/${productId}`);
              fetchStock();
          } catch(err) {
              alert(err.response?.data?.error || 'Failed to delete product.');
          }
      }
  };

  if (loading) return <div>Loading stock...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="stock-list-container">
      <div className="stock-header">
        <input
          type="text"
          placeholder="Search products by name or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
         <button className="refresh-btn" onClick={fetchStock}>
           🔄 Refresh
         </button>
      </div>

      {features.lowStockAlert && lowStockItems.length > 0 && (
        <div className="low-stock-alert">
          <h3>⚠️ Low Stock Alerts</h3>
          <ul>
            {lowStockItems.map((item) => (
              <li key={item._id}>
                <strong>{item.name}</strong> - Only {item.quantity} left in stock!
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item._id} className={item.quantity === 0 ? 'out-of-stock' : item.quantity <= LOW_STOCK_THRESHOLD ? 'low-stock' : ''}>
                  <td>{item.barcode}</td>
                  <td>{item.name}</td>
                  <td>₹{item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <button className="action-btn restock-btn" onClick={() => handleRestock(item)}>Restock</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(item._id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}