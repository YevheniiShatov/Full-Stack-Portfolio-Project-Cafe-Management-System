import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CountdownTimer from './CountdownTimer';
import { authStorage } from '../utils/authStorage';

const getStatusClass = (status) => {
    const s = String(status || '').toLowerCase();

    if (s.includes('declined') || s.includes('expired')) return 'status-badge status-badge--danger';
    if (s.includes('completed')) return 'status-badge status-badge--completed';
    if (s.includes('accepted')) return 'status-badge status-badge--accepted';
    if (s.includes('pending')) return 'status-badge status-badge--pending';

    return 'status-badge status-badge--neutral';
};

const CourierOrders = () => {
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const authToken = authStorage.getToken();

    const statusMap = {
        Pending: 'Pending',
        Accepted: 'Accepted by Cafe',
        'Accepted by Courier': 'Accepted by Courier',
        Declined: 'Declined',
        Completed: 'Completed',
    };

    const fetchOrders = useCallback(async () => {
        setLoading(true);

        try {
            const resAvailable = await axios.get(
                'http://localhost:8080/api/courier/orders',
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            const resMy = await axios.get(
                'http://localhost:8080/api/courier/orders/my',
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            setAvailableOrders(Array.isArray(resAvailable.data) ? resAvailable.data : []);
            setMyOrders(Array.isArray(resMy.data) ? resMy.data : []);

            setError('');
        } catch {
            setError('Failed to load courier orders.');
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    const acceptOrder = async (orderId) => {
        try {
            await axios.post(
                `http://localhost:8080/api/courier/orders/${orderId}/accept`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            fetchOrders();
        } catch {
            setError('Error accepting order.');
        }
    };

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(fetchOrders, 10000);

        return () => clearInterval(interval);
    }, [fetchOrders]);

    const renderOrder = (order, canAccept) => (
        <div key={order.id} className="order-card">

            <div className="order-card__top">
                <strong>Order #{order.id}</strong>

                <span className={getStatusClass(order.status)}>
                    {statusMap[order.status] || order.status}
                </span>
            </div>

            <div className="card-stack">

                <div>
                    <strong>Client</strong>
                    <p className="list-note">
                        {order.clientName || 'Unknown'} • {order.clientPhone || 'No phone'}
                    </p>
                </div>

                <div>
                    <strong>Address</strong>

                    {order.address ? (
                        <a
                            className="text-link"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open in Google Maps
                        </a>
                    ) : (
                        <p className="list-note">No address</p>
                    )}
                </div>

                <div>
                    <strong>Timer</strong>
                    <p className="list-note">
                        {order.acceptanceTime
                            ? <CountdownTimer acceptanceTime={order.acceptanceTime} />
                            : '—'}
                    </p>
                </div>

            </div>

            {canAccept && (
                <div className="order-card__footer">
                    <button onClick={() => acceptOrder(order.id)}>
                        Accept order
                    </button>
                </div>
            )}

        </div>
    );

    return (
        <div className="page-section">

            {error && (
                <div className="feedback-banner error">
                    {error}
                </div>
            )}

            <div className="orders-grid">

                <section className="summary-card">

                    <div className="section-header">
                        <h2 className="section-title">
                            New Orders
                        </h2>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            Loading orders...
                        </div>
                    ) : availableOrders.length === 0 ? (
                        <div className="empty-state">
                            No new orders
                        </div>
                    ) : (
                        <div className="card-stack">
                            {availableOrders.map((o) =>
                                renderOrder(o, true)
                            )}
                        </div>
                    )}

                </section>


                <section className="summary-card">

                    <div className="section-header">
                        <h2 className="section-title">
                            My Orders
                        </h2>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            Loading orders...
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div className="empty-state">
                            No accepted orders
                        </div>
                    ) : (
                        <div className="card-stack">
                            {myOrders.map((o) =>
                                renderOrder(o, false)
                            )}
                        </div>
                    )}

                </section>

            </div>

        </div>
    );
};

export default CourierOrders;
