import React, { useState, useEffect, useMemo, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../api'; // Your centralized API service
import './Restaurant.css'; // You'll need to create this new CSS file

// --- Main Component ---
export default function RestaurantPOS({ user }) {
  // --- State Management ---
  const [tables, setTables] = useState([]); // e.g., [{ number: 1, status: 'available' }, { number: 2, status: 'occupied' }]
  const [menuItems, setMenuItems] = useState([]); // The restaurant's menu
  const [categories, setCategories] = useState([]); // e.g., ['Appetizers', 'Main Course', 'Desserts']
  const [activeCategory, setActiveCategory] = useState('');
  
  const [selectedTable, setSelectedTable] = useState(null); // The currently selected table object
  const [currentOrder, setCurrentOrder] = useState([]); // Items for the selected table
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // You'll create these new API endpoints on your backend
      const [tablesRes, menuRes] = await Promise.all([
        API.get('/api/restaurant/tables'),
        API.get('/api/restaurant/menu')
      ]);
      setTables(tablesRes.data || []);
      setMenuItems(menuRes.data || []);
      
      // Dynamically create categories from the menu items
      const uniqueCategories = [...new Set(menuRes.data.map(item => item.category))];
      setCategories(uniqueCategories);
      setActiveCategory(uniqueCategories[0] || '');

    } catch (err) {
      setMessage('Error fetching restaurant data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Core Restaurant Functions ---

  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    // If the table is occupied, fetch its current order
    if (table.status === 'occupied') {
      try {
        const res = await API.get(`/api/restaurant/order/${table.number}`);
        setCurrentOrder(res.data.items || []);
      } catch (err) {
        setCurrentOrder([]);
        setMessage(`No active order found for Table ${table.number}. Starting a new one.`);
      }
    } else {
      // It's an available table, start a fresh order
      setCurrentOrder([]);
    }
  };

  const addItemToOrder = (menuItem) => {
    if (!selectedTable) {
      setMessage("Please select a table first!");
      return;
    }
    
    setCurrentOrder(prevOrder => {
      const existingItem = prevOrder.find(item => item.name === menuItem.name && item.status !== 'KOT Sent');
      if (existingItem) {
        // Increase quantity of existing item if it hasn't been sent to kitchen yet
        return prevOrder.map(item => 
          item.name === menuItem.name && item.status !== 'KOT Sent'
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price } 
            : item
        );
      } else {
        // Add new item to the order
        return [...prevOrder, { ...menuItem, quantity: 1, subtotal: menuItem.price, status: 'New' }];
      }
    });
  };

  const generateKOT = async () => {
    // A KOT only includes items that are 'New'
    const newItemsForKOT = currentOrder.filter(item => item.status === 'New');
    if (newItemsForKOT.length === 0) {
      setMessage("No new items to send to the kitchen.");
      return;
    }

    try {
      // This API endpoint saves the order and tells the kitchen what to make
      await API.post(`/api/restaurant/kot`, {
        tableNumber: selectedTable.number,
        items: newItemsForKOT
      });

      // Show a confirmation and update the status of sent items
      alert(`KOT for Table ${selectedTable.number} sent to kitchen!`);
      
      setCurrentOrder(prevOrder => 
        prevOrder.map(item => 
          item.status === 'New' ? { ...item, status: 'KOT Sent' } : item
        )
      );
      
      // Mark the table as occupied if it was available
      if (selectedTable.status === 'available') {
        setTables(prevTables => 
          prevTables.map(t => t.number === selectedTable.number ? {...t, status: 'occupied'} : t)
        );
        setSelectedTable({...selectedTable, status: 'occupied'});
      }

    } catch (err) {
      setMessage('Failed to send KOT.');
    }
  };
  
  const generateFinalBill = () => {
    if (!selectedTable || currentOrder.length === 0) {
      setMessage("No order to bill.");
      return;
    }

    const doc = new jsPDF();
    const subTotal = currentOrder.reduce((sum, item) => sum + item.subtotal, 0);
    const gstAmount = subTotal * 0.05; // Example 5% GST
    const grandTotal = subTotal + gstAmount;
    
    doc.setFontSize(18);
    doc.text(user.shopName || "Our Restaurant", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Table: ${selectedTable.number}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleString('en-IN')}`, 14, 35);

    autoTable(doc, {
      startY: 45,
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: currentOrder.map(item => [
        item.name,
        item.quantity,
        `₹${item.price.toFixed(2)}`,
        `₹${item.subtotal.toFixed(2)}`
      ]),
      theme: 'grid',
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Subtotal: ₹${subTotal.toFixed(2)}`, 150, finalY);
    doc.text(`GST (5%): ₹${gstAmount.toFixed(2)}`, 150, finalY + 7);
    doc.setFontSize(14);
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 150, finalY + 14);

    doc.save(`Bill-Table-${selectedTable.number}.pdf`);
  };

  const closeTableAndSettle = async () => {
    try {
      await API.post('/api/restaurant/close-bill', { tableNumber: selectedTable.number });
      alert(`Table ${selectedTable.number} has been settled and is now available.`);
      
      // Reset everything
      setCurrentOrder([]);
      setSelectedTable(null);
      setTables(prevTables => 
          prevTables.map(t => t.number === selectedTable.number ? {...t, status: 'available'} : t)
      );

    } catch (err) {
      setMessage('Failed to close table.');
    }
  };
  
  const filteredMenu = useMemo(() => menuItems.filter(item => item.category === activeCategory), [menuItems, activeCategory]);

  if (loading) return <div>Loading Restaurant Floor...</div>;

  // --- JSX Layout ---
  return (
    <div className="restaurant-pos-container">
      {/* Panel 1: Table Layout */}
      <div className="tables-panel">
        <h3>Tables</h3>
        <div className="table-grid">
          {tables.map(table => (
            <div 
              key={table.number} 
              className={`table-box ${table.status} ${selectedTable?.number === table.number ? 'selected' : ''}`}
              onClick={() => handleSelectTable(table)}
            >
              {table.number}
            </div>
          ))}
        </div>
      </div>
      
      {/* Panel 2: Menu */}
      <div className="menu-panel">
        <h3>Menu</h3>
        <div className="category-tabs">
          {categories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? 'active' : ''}>{cat}</button>)}
        </div>
        <div className="menu-grid">
          {filteredMenu.map(item => (
            <div key={item._id} className="menu-item-box" onClick={() => addItemToOrder(item)}>
              {item.name}<br/><span>₹{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel 3: Order & Billing */}
      <div className="order-panel">
        <h3>Order for Table: {selectedTable ? selectedTable.number : 'N/A'}</h3>
        <div className="order-items-list">
          {currentOrder.length > 0 ? (
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {currentOrder.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.subtotal.toFixed(2)}</td>
                    <td><span className={`status-${item.status.replace(' ', '-')}`}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="empty-order-text">Select a table and add items from the menu.</p>}
        </div>
        <div className="order-actions">
           <button className="kot-btn" onClick={generateKOT} disabled={!selectedTable}>Generate KOT</button>
           <button className="bill-btn" onClick={generateFinalBill} disabled={!selectedTable}>Generate Bill</button>
           <button className="settle-btn" onClick={closeTableAndSettle} disabled={!selectedTable}>Settle & Close Table</button>
        </div>
        {message && <p className="pos-message">{message}</p>}
      </div>
    </div>
  );
}