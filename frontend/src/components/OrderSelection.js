import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderSelection = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/orders');
                setOrders(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error loading orders:', error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="page-section">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Legacy compatibility</span>
                    <h1 className="page-title">Order selection for courier</h1>
                </div>
            </div>

            {orders.length > 0 ? (
                <div className="card-stack">
                    {orders.map((order) => (
                        <div key={order.id} className="list-card">
                            <div className="cart-row">
                                <strong>Order #{order.id}</strong>
                                <span className="surface-badge">{order.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <strong>No orders</strong>
                    <p style={{ margin: 0 }}>No orders available for this compatibility view.</p>
                </div>
            )}
        </div>
    );
};

export default OrderSelection;
