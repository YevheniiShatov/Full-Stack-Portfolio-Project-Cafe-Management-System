import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { authStorage } from '../utils/authStorage';

const getStatusClass = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('declined') || normalized.includes('expired')) return 'status-badge status-badge--danger';
    if (normalized.includes('accepted')) return 'status-badge status-badge--accepted';
    if (normalized.includes('completed')) return 'status-badge status-badge--completed';
    if (normalized.includes('pending')) return 'status-badge status-badge--pending';
    return 'status-badge status-badge--neutral';
};

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUserOrders = async () => {
        try {
            const token = authStorage.getToken();
            const response = await axios.get('http://localhost:8080/api/orders/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOrders(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (err) {
            setError('Error loading order history.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserOrders();
        const interval = setInterval(fetchUserOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="page-section">
                <div className="loading-card" style={{ width: '100%' }}>
                    <div className="loading-spinner" />
                    <strong>Loading orders</strong>
                    <span>Collecting client history from backend.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-section">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Client history</span>
                    <h1 className="page-title">Order history</h1>
                    <p className="page-lead" style={{ marginBottom: 0 }}>
                        The list is now presented as readable order cards with explicit totals and status badges.
                    </p>
                </div>
                <button type="button" className="btn btn--secondary" onClick={fetchUserOrders}>Refresh</button>
            </div>

            {error && <div className="feedback-banner error">{error}</div>}

            {orders.length === 0 ? (
                <div className="empty-state" style={{ marginTop: '18px' }}>
                    <strong>No orders found</strong>
                    <p style={{ margin: 0 }}>Your history is empty right now.</p>
                </div>
            ) : (
                <div className="orders-grid" style={{ marginTop: '18px' }}>
                    {orders.map((order) => {
                        const total = (order.items || []).reduce(
                            (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
                            0
                        );

                        return (
                            <article key={order.id} className="order-card">
                                <div className="order-card__top">
                                    <div>
                                        <strong>Order #{order.id}</strong>
                                        <p className="list-note" style={{ margin: 0 }}>Client: {order.clientName || '—'}</p>
                                    </div>
                                    <span className={getStatusClass(order.status)}>{order.status}</span>
                                </div>

                                <div className="order-card__items">
                                    {(order.items || []).length > 0 ? (
                                        order.items.map((item) => (
                                            <div key={`${order.id}-${item.menuItem?.id}-${item.quantity}`} className="list-card">
                                                <div className="cart-row">
                                                    <div>
                                                        <strong>{item.name || 'Item'}</strong>
                                                        <p className="list-note" style={{ margin: 0 }}>${item.price|| 0} each</p>
                                                    </div>
                                                    <span className="surface-badge">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <strong>No items</strong>
                                            <p style={{ margin: 0 }}>Backend returned order without item list.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="order-card__footer">
                                    <span className="surface-badge">Total: ${total.toFixed(2)}</span>
                                    <span className="surface-badge">Status: {order.status}</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserOrders;
