// src/components/ContactPage.js

import React from 'react';
import './InfoPages.css'; // We will create this CSS file in the next step

export default function ContactPage() {
    // 👇 REPLACE THIS ENTIRE FUNCTION
    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('http://localhost:5000/api/contact', { // Make sure this URL matches your backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            alert(result.message); // Show success message
            form.reset(); // Clear the form after successful submission

        } catch (error) {
            console.error('Form submission error:', error);
            alert(`Error: ${error.message}`); // Show error message
        }
    };

    return (
        <div className="info-page-container">
            <h2>Get in Touch</h2>
            <p className="page-intro">
                Have questions or need support? We'd love to hear from you.
            </p>
            
            <div className="contact-details">
                <p><strong>Support Email:</strong> <a href="mailto:karanindrale253@gmail.com">karanindrale253@gmail.com</a></p>
                <p><strong>Sales Email:</strong> <a href="mailto:komsyte2026@gmail.com">komsyte2026@gmail.com</a></p>
                <p><strong>Address:</strong> New hanuman Nagar, Garkheda, Chh. Sambhaji Nagar, Maharashtra</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                <h3>Send Us a Message</h3>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" required />

                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />

                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" required />

                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="5" required></textarea>

                <button type="submit">Send Message</button>
            </form>
        </div>
    );
}