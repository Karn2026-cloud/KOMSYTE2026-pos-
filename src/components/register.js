import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import API from '../api';
import './Register.css';

const FeatureGuard = ({ isAllowed, children, message }) => {
  if (isAllowed) {
    return children;
  }
  return (
    <div className="feature-locked-notice">
      <p>🔒 {message}</p>
    </div>
  );
};

export default function RegisterProduct({ user }) {
  const planFeatures = {
    free: { updateQuantity: false, maxProducts: 10, bulkUpload: false },
    '299': { updateQuantity: true, maxProducts: 50, bulkUpload: true },
    '699': { updateQuantity: true, maxProducts: 100, bulkUpload: true },
    '1499': { updateQuantity: true, maxProducts: Infinity, bulkUpload: true },
  };
  const features = planFeatures[user?.subscription?.plan] || planFeatures.free;

  const [formData, setFormData] = useState({ barcode: "", name: "", price: "", quantity: "" });
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const clearMessage = () => setTimeout(() => setMessage(""), 5000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (products.length >= features.maxProducts && !isUpdateMode) {
      // ✅ Replaced alert with a clear message
      setMessage(`Error: Your plan's limit of ${features.maxProducts} products has been reached.`);
      clearMessage();
      return;
    }
    
    try {
      let response;
      if (isUpdateMode) {
        response = await API.put(`/api/products/${formData.barcode}`, { quantity: formData.quantity });
      } else {
        response = await API.post('/api/products', formData);
      }
      setMessage(response.data.message);
      setFormData({ barcode: "", name: "", price: "", quantity: "" });
      setIsUpdateMode(false);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || 'Operation failed'}`);
    }
    clearMessage();
  };

  const handleExcelUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const excelData = new FormData();
      excelData.append("file", file);
      setIsUploading(true);

      try {
          const endpoint = isUpdateMode ? '/api/stock/bulk-update' : '/api/products/bulk-add';
          const res = await API.post(endpoint, excelData, { headers: { 'Content-Type': 'multipart/form-data' }});
          setMessage(res.data.message);
      } catch (err) {
          setMessage(`Error: ${err.response?.data?.message || 'Bulk operation failed'}`);
      } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          clearMessage();
      }
  };
  
  // Barcode scanning logic remains the same
  // ...

  return (
    <div className="register-container">
      <div className="form-wrapper">
        <div className="form-card">
          <h3>{isUpdateMode ? "Update Product Stock" : "Register a New Product"}</h3>
          {/* Form and other elements */}
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="register-product-container">
      <h2>{isUpdateMode ? "Update Product Stock" : "Register New Product"}</h2>
      <FeatureGuard
        isAllowed={features.updateQuantity}
        message="The ability to update existing stock is a premium feature."
      >
        <div className="toggle-mode">
          <label>
            <input type="checkbox" checked={isUpdateMode} onChange={(e) => setIsUpdateMode(e.target.checked)} />
            Update Stock Only
          </label>
        </div>
      </FeatureGuard>
      <div className="content-wrapper">
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <input name="barcode" placeholder="Barcode" value={formData.barcode} onChange={handleChange} required />
            {!isUpdateMode && (
              <>
                <input name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} ref={nameInputRef} required={!isUpdateMode}/>
                <input name="price" placeholder="Price (₹)" type="number" value={formData.price} onChange={handleChange} required={!isUpdateMode} />
              </>
            )}
            <input name="quantity" placeholder="Quantity to Add" type="number" value={formData.quantity} onChange={handleChange} required />
            <button type="submit" disabled={isUploading || isScanning}>
              {isUpdateMode ? "Update Stock" : "Add Product"}
            </button>
          </form>
          <hr/>
          <h4>Tools</h4>
          <div className="tools-section">
             <button onClick={isScanning ? stopScanner : startScanner} disabled={isUploading} className={isScanning ? 'stop-scan' : ''}>
              {isScanning ? "🛑 Stop Scanner" : "📷 Scan Barcode"}
            </button>
            <div id="reader" style={{ display: isScanning ? 'block' : 'none', marginTop: '10px' }}></div>
          </div>
          <FeatureGuard
            isAllowed={features.bulkUpload}
            message="Bulk product registration via Excel is a premium feature."
          >
            <div className="excel-upload">
              <label htmlFor="excelFile">{isUpdateMode ? "Update Stock via Excel" : "Add Products via Excel"}:</label>
              <input id="excelFile" type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} disabled={isUploading || isScanning} ref={fileInputRef}/>
            </div>
          </FeatureGuard>
          {message && <p className={`message ${message.includes("Error") ? 'error' : 'success'}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

