import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MenuSelection = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8080/api/menu')
            .then((response) => setMenuItems(Array.isArray(response.data) ? response.data : []))
            .catch(() => setMessage('Failed to load menu.'));
    }, []);

    const handleSelectItem = (item) => {
        setSelectedItems((prev) => [...prev, item.id]);
    };

    const handleSubmitOrder = () => {
        axios.post('http://localhost:8080/api/orders', { items: selectedItems })
            .then(() => setMessage('Order placed successfully.'))
            .catch(() => setMessage('Failed to place order.'));
    };

    return (
        <div className="page-section">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Legacy compatibility</span>
                    <h1 className="page-title">Menu</h1>
                </div>
            </div>

            <div className="menu-grid">
                {menuItems.map((item) => (
                    <article key={item.id} className="menu-card">
                        <div className="card-stack">
                            <strong>{item.name}</strong>
                            <span className="price-chip">${item.price}</span>
                            <button type="button" className="btn btn--secondary" onClick={() => handleSelectItem(item)}>Add to order</button>
                        </div>
                    </article>
                ))}
            </div>

            <div className="form-actions" style={{ marginTop: '18px' }}>
                <button type="button" onClick={handleSubmitOrder}>Submit order</button>
            </div>

            {message && <div className={`feedback-banner ${message.toLowerCase().includes('success') ? 'success' : 'error'}`} style={{ marginTop: '18px' }}>{message}</div>}
        </div>
    );
};

export default MenuSelection;
