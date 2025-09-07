// src/components/AboutPage.js

import React, { useState } from 'react';
import './InfoPages.css'; // We will create this CSS file in the next step

// Sub-components for policies (kept in the same file for simplicity)
const PrivacyPolicy = () => (
    <div className="policy-content">
        <h4>Privacy Policy</h4>
        <p>Last Updated: September 7, 2025</p>
        <p>KOMSyte is committed to protecting your privacy. We collect information like your name, email, and business data solely to provide and improve our KOMSyte-POS service. We do not sell your data. We use industry-standard security measures to protect your information.</p>
    </div>
);

const TermsAndConditions = () => (
    <div className="policy-content">
        <h4>Terms & Conditions</h4>
        <p>By using KOMSyte-POS, you agree to our terms. You are responsible for maintaining the confidentiality of your account password. The service is billed on a subscription basis and is the intellectual property of KOMSyte. These terms are governed by the laws of India.</p>
    </div>
);

const RefundPolicy = () => (
    <div className="policy-content">
        <h4>Cancellation & Refund Policy</h4>
        <p>You can cancel your subscription at any time. For annual subscriptions, a full refund is available if you cancel within 5 days of purchase. Monthly subscriptions are non-refundable. Refunds will be processed within 7-10 business days.</p>
    </div>
);


export default function AboutPage() {
    const [activePolicy, setActivePolicy] = useState(null);

    const renderPolicy = () => {
        switch (activePolicy) {
            case 'privacy':
                return <PrivacyPolicy />;
            case 'terms':
                return <TermsAndConditions />;
            case 'refund':
                return <RefundPolicy />;
            default:
                return null;
        }
    };

    return (
        <div className="info-page-container">
            <h2>About KOMSyte</h2>
            <p className="page-intro">
                Founded in 2025, our mission is to empower local businesses like yours with a powerful, intuitive, and affordable billing solution. KOMSyte-POS is designed to streamline your operations, so you can focus on growth.
            </p>
            
            <div className="policy-navigation">
                <h3>Legal & Policies</h3>
                <p>Select a policy to view its details.</p>
                <button onClick={() => setActivePolicy('privacy')} className={activePolicy === 'privacy' ? 'active' : ''}>Privacy Policy</button>
                <button onClick={() => setActivePolicy('terms')} className={activePolicy === 'terms' ? 'active' : ''}>Terms & Conditions</button>
                <button onClick={() => setActivePolicy('refund')} className={activePolicy === 'refund' ? 'active' : ''}>Refund Policy</button>
            </div>

            {renderPolicy()}
        </div>
    );
}















