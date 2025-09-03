// src/components/Billing.js (Correct Version)

import React, { useState, useEffect } from 'react';
import API from '../api';
import './Billing.css'; // You may need to create this CSS file

const Billing = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch all products once when the component loads for quick searching
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await API.get('/api/stock');
                setAllProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch products for billing:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Update total whenever the cart changes
    useEffect(() => {
        const newTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(newTotal);
    }, [cart]);

    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        if (!barcode) return;

        const product = allProducts.find(p => p.barcode === barcode);
        if (!product) {
            alert('Product not found!');
            setBarcode('');
            return;
        }
        
        if (product.quantity <= 0) {
            alert('This product is out of stock!');
            setBarcode('');
            return;
        }

        // Check if product is already in the cart
        const existingItemIndex = cart.findIndex(item => item.barcode === barcode);
        if (existingItemIndex > -1) {
            // Increase quantity if item exists
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += 1;
            setCart(newCart);
        } else {
            // Add new item to cart
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        setBarcode(''); // Clear input after adding
    };

    const handleFinalizeBill = async () => {
        if (cart.length === 0) {
            alert("Cart is empty.");
            return;
        }

        try {
            const billData = {
                items: cart.map(({ barcode, name, price, quantity }) => ({
                    barcode, name, price, quantity,
                })),
            };

            await API.post('/api/bills', billData);
            alert('Bill created successfully!');
            setCart([]); // Clear the cart
        } catch (error) {
            console.error("Failed to create bill:", error);
            alert(error.response?.data?.error || "Error creating bill.");
        }
    };

    if (loading) {
        return <div>Loading billing system...</div>;
    }

    return (
        <div className="billing-container">
            <h3>New Bill</h3>
            <div className="billing-layout">
                {/* Left side: Barcode entry and cart */}
                <div className="cart-section">
                    <form onSubmit={handleBarcodeSubmit}>
                        <input
                            type="text"
                            placeholder="Scan or enter barcode..."
                            className="barcode-input"
                            value={barcode}
                            onChange={e => setBarcode(e.target.value)}
                            autoFocus
                        />
                        <button type="submit">Add Item</button>
                    </form>
                    <div className="cart-items">
                        {cart.length === 0 && <p>Cart is empty</p>}
                        {cart.map((item, index) => (
                            <div key={index} className="cart-item">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side: Total and finalize button */}
                <div className="summary-section">
                    <h4>Total Amount</h4>
                    <div className="total-amount">₹{total.toFixed(2)}</div>
                    <button
                        className="finalize-button"
                        onClick={handleFinalizeBill}
                        disabled={cart.length === 0}
                    >
                        Finalize Bill
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;