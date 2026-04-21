import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DistrictEditor from './DistrictEditor';
import './CafeAdminDashboard.css';
import { authStorage } from '../utils/authStorage';

const getStatusClass = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('declined')) return 'status-badge status-badge--danger';
    if (normalized.includes('completed')) return 'status-badge status-badge--completed';
    if (normalized.includes('accepted')) return 'status-badge status-badge--accepted';
    if (normalized.includes('pending')) return 'status-badge status-badge--pending';
    return 'status-badge status-badge--neutral';
};

const CafeAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('menu');
    const [menuItems, setMenuItems] = useState([]);
    const [newDish, setNewDish] = useState({ id: null, name: '', price: '', description: '', imageUrl: '' });
    const [districts, setDistricts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [feedback, setFeedback] = useState('');

    const token = authStorage.getToken();
    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                if (activeTab === 'menu') {
                    const res = await axios.get('http://localhost:8080/api/cafe-admin/menu', { headers: authHeaders });
                    if (isMounted) setMenuItems(Array.isArray(res.data) ? res.data : []);
                }
                if (activeTab === 'zones') {
                    const res = await axios.get('http://localhost:8080/api/cafe-admin/districts', { headers: authHeaders });
                    if (isMounted) setDistricts(Array.isArray(res.data) ? res.data : []);
                }
                if (activeTab === 'orders') {
                    const res = await axios.get('http://localhost:8080/api/orders', { headers: authHeaders });
                    if (isMounted) setOrders(Array.isArray(res.data) ? res.data : []);
                }
            } catch (err) {
                if (isMounted) setFeedback('Error while loading data.');
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [activeTab, authHeaders]);

    const refreshMenu = async () => {
        const res = await axios.get('http://localhost:8080/api/cafe-admin/menu', { headers: authHeaders });
        setMenuItems(Array.isArray(res.data) ? res.data : []);
    };

    const refreshDistricts = async () => {
        const res = await axios.get('http://localhost:8080/api/cafe-admin/districts', { headers: authHeaders });
        setDistricts(Array.isArray(res.data) ? res.data : []);
    };

    const refreshOrders = async () => {
        const res = await axios.get('http://localhost:8080/api/orders', { headers: authHeaders });
        setOrders(Array.isArray(res.data) ? res.data : []);
    };

    const handleSaveDish = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`http://localhost:8080/api/cafe-admin/menu/${newDish.id}`, newDish, { headers: authHeaders });
                setFeedback('Dish updated successfully.');
            } else {
                await axios.post('http://localhost:8080/api/cafe-admin/menu', newDish, { headers: authHeaders });
                setFeedback('Dish added successfully.');
            }

            setNewDish({ id: null, name: '', price: '', description: '', imageUrl: '' });
            setIsEditing(false);
            await refreshMenu();
        } catch (err) {
            setFeedback('Failed to save dish.');
        }
    };

    const handleEditClick = (item) => {
        setNewDish(item);
        setIsEditing(true);
        setActiveTab('menu');
        setFeedback('Editing selected dish.');
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('Delete this dish?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/cafe-admin/menu/${id}`, { headers: authHeaders });
            setFeedback('Dish removed successfully.');
            await refreshMenu();
        } catch (err) {
            setFeedback('Error deleting dish.');
        }
    };

    const updateOrderStatus = async (orderId, action) => {
        try {
            await axios.put(`http://localhost:8080/api/orders/${orderId}/${action}`, {}, { headers: authHeaders });
            setFeedback(`Order #${orderId} updated via ${action}.`);
            await refreshOrders();
        } catch (err) {
            setFeedback('Error updating order.');
        }
    };

    return (
        <div className="cafe-admin-dashboard">
            <section className="page-section">
                <div className="page-header">
                    <div>
                        <span className="eyebrow">Cafe workspace</span>
                        <h1 className="page-title">Cafe control center</h1>
                        <p className="page-lead" style={{ marginBottom: 0 }}>
                            Menu management, delivery zones, and order operations now live inside a single polished admin surface.
                        </p>
                    </div>
                    <div className="badge-row">
                        <span className="surface-badge">Menu: {menuItems.length}</span>
                        <span className="surface-badge">Zones: {districts.length}</span>
                        <span className="surface-badge">Orders: {orders.length}</span>
                    </div>
                </div>

                <div className="tabs">
                    <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>Menu</button>
                    <button className={activeTab === 'zones' ? 'active' : ''} onClick={() => setActiveTab('zones')}>Delivery zones</button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
                </div>

                {feedback && (
                    <div className={`feedback-banner ${feedback.toLowerCase().includes('error') || feedback.toLowerCase().includes('fail') ? 'error' : 'success'}`}>
                        {feedback}
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="content-grid" style={{ marginTop: '24px' }}>
                        <section className="summary-card">
                            <div className="section-header">
                                <div>
                                    <h2 className="section-title">{isEditing ? 'Edit dish' : 'Add new dish'}</h2>
                                    <p className="section-copy" style={{ marginBottom: 0 }}>Merchant menu editor rebuilt as a proper product form.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveDish} className="form-grid">
                                <div className="field">
                                    <label htmlFor="dish-name">Dish name</label>
                                    <input id="dish-name" type="text" placeholder="Dish name" value={newDish.name} onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} required />
                                </div>
                                <div className="field">
                                    <label htmlFor="dish-price">Price</label>
                                    <input id="dish-price" type="number" placeholder="Price" value={newDish.price} onChange={(e) => setNewDish({ ...newDish, price: e.target.value })} required />
                                </div>
                                <div className="field">
                                    <label htmlFor="dish-description">Description</label>
                                    <textarea id="dish-description" placeholder="Description" value={newDish.description} onChange={(e) => setNewDish({ ...newDish, description: e.target.value })} />
                                </div>
                                <div className="field">
                                    <label htmlFor="dish-image">Image URL</label>
                                    <input id="dish-image" type="text" placeholder="https://..." value={newDish.imageUrl} onChange={(e) => setNewDish({ ...newDish, imageUrl: e.target.value })} />
                                </div>
                                <div className="form-actions">
                                    <button type="submit">{isEditing ? 'Save changes' : 'Add dish'}</button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn btn--secondary"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setNewDish({ id: null, name: '', price: '', description: '', imageUrl: '' });
                                                setFeedback('Edit mode cleared.');
                                            }}
                                        >
                                            Cancel editing
                                        </button>
                                    )}
                                </div>
                            </form>
                        </section>

                        <section className="summary-card">
                            <div className="section-header">
                                <div>
                                    <h2 className="section-title">Current menu</h2>
                                    <p className="section-copy" style={{ marginBottom: 0 }}>Cards make the list presentable for demo and easier to scan in use.</p>
                                </div>
                            </div>

                            {menuItems.length > 0 ? (
                                <ul className="menu-list">
                                    {menuItems.map((item, index) => (
                                        <li key={item.id ?? `menu-${index}`} className="menu-item">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} />
                                            ) : (
                                                <div className="menu-card__placeholder" style={{ width: '96px', height: '96px', borderRadius: '16px' }}>🍽️</div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <strong>{item.name}</strong>
                                                <p className="list-note" style={{ marginTop: '6px', marginBottom: '8px' }}>{item.description || 'No description.'}</p>
                                                <span className="price-chip">{item.price}€</span>
                                                <div className="actions">
                                                    <button type="button" className="btn btn--secondary" onClick={() => handleEditClick(item)}>Edit</button>
                                                    <button type="button" className="btn btn--danger" onClick={() => handleDeleteClick(item.id)}>Delete</button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="empty-state">
                                    <strong>No dishes yet</strong>
                                    <p style={{ margin: 0 }}>Add the first menu position to populate this catalogue.</p>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'zones' && (
                    <div className="content-grid" style={{ marginTop: '24px' }}>
                        <section className="summary-card">
                            <div className="section-header">
                                <div>
                                    <h2 className="section-title">Delivery zone editor</h2>
                                    <p className="section-copy" style={{ marginBottom: 0 }}>
                                        The map is now framed as an admin tool rather than appearing as a detached technical widget.
                                    </p>
                                </div>
                            </div>

                            <div className="map-frame">
                                <DistrictEditor
                                    existingDistricts={districts}
                                    active={activeTab === 'zones'}
                                    onSave={(district) => {
                                        axios.post('http://localhost:8080/api/cafe-admin/districts', district, { headers: authHeaders })
                                            .then(refreshDistricts)
                                            .then(() => setFeedback('District added successfully.'))
                                            .catch(() => setFeedback('Error saving district.'));
                                    }}
                                    onUpdate={(id, payload) => {
                                        axios.put(`http://localhost:8080/api/cafe-admin/districts/${id}`, payload, { headers: authHeaders })
                                            .then(refreshDistricts)
                                            .then(() => setFeedback('District updated successfully.'))
                                            .catch(() => setFeedback('Error updating district.'));
                                    }}
                                    onDelete={(id) => {
                                        axios.delete(`http://localhost:8080/api/cafe-admin/districts/${id}`, { headers: authHeaders })
                                            .then(refreshDistricts)
                                            .then(() => setFeedback(`District #${id} deleted.`))
                                            .catch(() => setFeedback('Error deleting district.'));
                                    }}
                                />
                            </div>
                        </section>

                        <section className="summary-card">
                            <div className="section-header">
                                <div>
                                    <h2 className="section-title">Zone overview</h2>
                                    <p className="section-copy" style={{ marginBottom: 0 }}>Saved districts and delivery prices from backend.</p>
                                </div>
                            </div>

                            {districts.length > 0 ? (
                                <div className="card-stack">
                                    {districts.map((district) => (
                                        <div key={district.id} className="list-card">
                                            <strong>{district.name}</strong>
                                            <p className="list-note" style={{ marginTop: '6px', marginBottom: '8px' }}>
                                                Coordinates: {Array.isArray(district.coordinates) ? district.coordinates.length : 0} points
                                            </p>
                                            <span className="price-chip">{district.deliveryPrice}€ delivery</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <strong>No delivery zones</strong>
                                    <p style={{ margin: 0 }}>Draw the first district on the map to enable delivery segmentation.</p>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="summary-card" style={{ marginTop: '24px' }}>
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Operational orders</h2>
                                <p className="section-copy" style={{ marginBottom: 0 }}>The raw table has been redesigned into a readable admin surface with explicit actions.</p>
                            </div>
                        </div>

                        {orders.length > 0 ? (
                            <div className="table-card">
                                <div className="table-scroll">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Status</th>
                                                <th>Customer</th>
                                                <th>Items</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>#{order.id}</td>
                                                    <td><span className={getStatusClass(order.status)}>{order.status}</span></td>
                                                    <td>
                                                        <strong>{order.clientName || '—'}</strong>
                                                        <div className="meta-line">{order.clientPhone || '—'}</div>
                                                        <div className="meta-line">{order.clientEmail || '—'}</div>
                                                    </td>
                                                    <td>
                                                        <ul className="clean-list">
                                                            {(order.orderItems || []).map((item, idx) => (
                                                                <li key={`${order.id}-${idx}`}>
                                                                    {item.name} — {item.quantity} pcs.
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td>
                                                        <div className="card-actions">
                                                            {order.status === 'Pending' && (
                                                                <>
                                                                    <button type="button" className="btn btn--secondary" onClick={() => updateOrderStatus(order.id, 'accept')}>Accept</button>
                                                                    <button type="button" className="btn btn--danger" onClick={() => updateOrderStatus(order.id, 'decline')}>Decline</button>
                                                                </>
                                                            )}
                                                            {order.status === 'Accepted' && (
                                                                <button type="button" className="btn btn--success" onClick={() => updateOrderStatus(order.id, 'complete')}>Complete</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <strong>No orders yet</strong>
                                <p style={{ margin: 0 }}>Cafe orders will appear here once clients submit them.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default CafeAdminDashboard;
