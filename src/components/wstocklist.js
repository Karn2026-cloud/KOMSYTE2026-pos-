// src/components/StockList.js

import React, { useState, useEffect, useMemo } from 'react';
import API from '../api';
import './StockList.css'; // Create this file for styling

const StockList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                setLoading(true);
                const response = await API.get('/api/stock');
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch stock:", error);
                alert("Could not load stock data.");
            } finally {
                setLoading(false);
            }
        };

        fetchStock();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) {
            return products;
        }
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode.includes(searchTerm)
        );
    }, [products, searchTerm]);

    if (loading) {
        return <div>Loading stock...</div>;
    }

    return (
        <div className="stock-list-container">
            <h3>Product Stock List</h3>
            <input
                type="text"
                placeholder="Search by name or barcode..."
                className="stock-search-bar"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="stock-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Barcode</th>
                            <th>Price (₹)</th>
                            <th>Quantity Left</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <tr key={product._id}>
                                    <td>{product.name}</td>
                                    <td>{product.barcode}</td>
                                    <td>{product.price.toFixed(2)}</td>
                                    <td>{product.quantity}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No products found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockList;