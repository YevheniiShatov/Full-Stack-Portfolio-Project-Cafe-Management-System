import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { authStorage } from '../utils/authStorage';

const getStatusClass = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('accepted')) return 'status-badge status-badge--accepted';
    if (normalized.includes('pending')) return 'status-badge status-badge--pending';
    return 'status-badge status-badge--neutral';
};

const CafeOrders = () => {
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmAccept, setConfirmAccept] = useState(null);

    const authToken = authStorage.getToken();
    const userEmail = authStorage.getUserEmail();

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/cafe/orders', {
                params: { email: userEmail },
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
                setError('');
            } else {
                setError('No available orders.');
            }
        } catch (err) {
            setError('Error loading cafe orders.');
        } finally {
            setLoading(false);
        }
    }, [authToken, userEmail]);

    useEffect(() => {
        if (userEmail) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 15000);
            return () => clearInterval(interval);
        }
        setError('Unable to retrieve user email.');
    }, [fetchOrders, userEmail]);

    const pendingOrders = orders.filter((order) => order.status === 'Pending');
    const acceptedOrders = orders.filter((order) => order.status === 'Accepted');

    const handleAcceptOrder = async (orderId) => {
        try {
            await axios.post(`http://localhost:8080/api/cafe/orders/${orderId}/accept`, {}, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setMessage(`Order #${orderId} has been accepted.`);
            setConfirmAccept(null);
            fetchOrders();
        } catch (err) {
            setMessage('Error while accepting the order.');
        }
    };

    const renderOrderCard = (order, canAccept) => (
        <article key={order.id} className="order-card">
            <div className="order-card__top">
                <div>
                    <strong>Order #{order.id}</strong>
                    <p className="list-note" style={{ margin: 0 }}>{order.cafeName || order.assignedCafe || 'Unknown cafe'}</p>
                </div>
                <span className={getStatusClass(order.status)}>{order.status}</span>
            </div>

            <div className="order-card__items">
                {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                        <div key={`${order.id}-${item.id || index}`} className="list-card">
                            <div className="cart-row">
                                <div>
                                    <strong>{item.name}</strong>
                                    <p className="list-note" style={{ margin: 0 }}>Qty: {item.quantity > 0 ? item.quantity : '0 (error)'}</p>
                                </div>
                                <span className="surface-badge">Menu item</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <strong>No items specified</strong>
                        <p style={{ margin: 0 }}>Backend returned this order without detailed items.</p>
                    </div>
                )}
            </div>

            {canAccept && (
                <div className="order-card__footer">
                    <button type="button" onClick={() => setConfirmAccept(order.id)}>Accept order</button>
                </div>
            )}
        </article>
    );

    return (
        <div className="page-section">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Cafe intake</span>
                    <h1 className="page-title">Cafe orders</h1>
                    <p className="page-lead" style={{ marginBottom: 0 }}>
                        Incoming and accepted orders are separated into distinct operational columns.
                    </p>
                </div>
                <button type="button" className="btn btn--secondary" onClick={fetchOrders}>Refresh orders</button>
            </div>

            {message && <div className={`feedback-banner ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>{message}</div>}
            {error && <div className="feedback-banner error" style={{ marginTop: '12px' }}>{error}</div>}

            <div className="orders-grid" style={{ marginTop: '24px' }}>
                <section className="summary-card">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Incoming</h2>
                            <p className="section-copy" style={{ marginBottom: 0 }}>Orders waiting for cafe acceptance.</p>
                        </div>
                        <span className="surface-badge">{pendingOrders.length}</span>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <strong>Loading pending orders</strong>
                            <p style={{ margin: 0 }}>Please wait.</p>
                        </div>
                    ) : pendingOrders.length > 0 ? (
                        <div className="card-stack">{pendingOrders.map((order) => renderOrderCard(order, true))}</div>
                    ) : (
                        <div className="empty-state">
                            <strong>No new orders</strong>
                            <p style={{ margin: 0 }}>No pending cafe orders right now.</p>
                        </div>
                    )}
                </section>

                <section className="summary-card">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Accepted</h2>
                            <p className="section-copy" style={{ marginBottom: 0 }}>Orders already accepted by the cafe.</p>
                        </div>
                        <span className="surface-badge">{acceptedOrders.length}</span>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <strong>Loading accepted orders</strong>
                            <p style={{ margin: 0 }}>Please wait.</p>
                        </div>
                    ) : acceptedOrders.length > 0 ? (
                        <div className="card-stack">{acceptedOrders.map((order) => renderOrderCard(order, false))}</div>
                    ) : (
                        <div className="empty-state">
                            <strong>No accepted orders</strong>
                            <p style={{ margin: 0 }}>Accepted orders will appear here.</p>
                        </div>
                    )}
                </section>
            </div>

            {confirmAccept && (
                <div className="modal">
                    <div className="modal-panel">
                        <span className="eyebrow">Confirmation</span>
                        <h2 className="section-title" style={{ marginTop: '10px', marginBottom: '12px' }}>Accept order #{confirmAccept}?</h2>
                        <p className="section-copy">This action preserves existing backend logic and only improves the decision surface.</p>
                        <div className="form-actions" style={{ marginTop: '18px' }}>
                            <button type="button" onClick={() => handleAcceptOrder(confirmAccept)}>Accept order</button>
                            <button type="button" className="btn btn--secondary" onClick={() => setConfirmAccept(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CafeOrders;
