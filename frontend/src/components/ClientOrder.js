import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { authStorage } from '../utils/authStorage';
import './ClientOrder.css';

const ClientOrder = () => {
    const [cafes, setCafes] = useState([]);
    const [selectedCafeId, setSelectedCafeId] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [address, setAddress] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loadingCafe, setLoadingCafe] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');

    const selectedCafe = useMemo(
        () => cafes.find((cafe) => Number(cafe.id) === Number(selectedCafeId)) || null,
        [cafes, selectedCafeId]
    );

    const cartTotal = selectedItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);

    const isValidPhone = (phone) => /^\d+$/.test(phone);

    useEffect(() => {
        if (!selectedCafe) {
            setMenuItems([]);
            return;
        }

        axios
            .get(`http://localhost:8080/api/menu/${selectedCafe.id}`)
            .then((res) => setMenuItems(Array.isArray(res.data) ? res.data : []))
            .catch(() => setError('Error loading menu.'));
    }, [selectedCafe]);

    const handleGetCafeByAddress = () => {
        if (!address.trim()) {
            setError('Please enter an address.');
            return;
        }

        setError('');
        setMessage('');
        setMenuItems([]);
        setSelectedItems([]);
        setCafes([]);
        setSelectedCafeId(null);
        setLoadingCafe(true);

        axios.post('http://localhost:8080/api/geo/address', { address })
            .then((response) => {
                const list = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
                setCafes(list);
                if (list.length === 1) {
                    setSelectedCafeId(list[0].id);
                }
                if (list.length === 0) {
                    setError('No cafes found for this address.');
                }
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    setError('No cafes found for this address.');
                } else {
                    setError('Error retrieving cafes.');
                }
            })
            .finally(() => setLoadingCafe(false));
    };

    const handleSelectItem = (item) => {
        setSelectedItems((prev) => {
            const existing = prev.find((current) => current.id === item.id);
            if (existing) {
                return prev.map((current) => current.id === item.id ? { ...current, quantity: current.quantity + 1 } : current);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const changeQuantity = (itemId, delta) => {
        setSelectedItems((prev) => prev
            .map((item) => item.id === itemId ? { ...item, quantity: item.quantity + delta } : item)
            .filter((item) => item.quantity > 0)
        );
    };

    const handleSubmitOrder = () => {
        const userEmail = authStorage.getUserEmail();
        const token = authStorage.getToken();

        if (!clientName.trim() || !isValidPhone(clientPhone) || !address.trim() || !selectedCafe) {
            setMessage('Please fill in all fields correctly.');
            return;
        }

        if (selectedItems.length === 0) {
            setMessage('The cart is empty.');
            return;
        }

        if (!token) {
            setMessage('You must be logged in to place an order.');
            return;
        }

        const orderData = {
            items: selectedItems.map((item) => ({
                id: Number(item.id),
                quantity: Number(item.quantity),
            })),
            address,
            cafeId: selectedCafe.id,
            clientName,
            clientPhone,
            clientEmail: userEmail,
        };

        axios.post('http://localhost:8080/api/orders', orderData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                setMessage('Order placed successfully.');
                setSelectedItems([]);
            })
            .catch((error) => {
                if (error.response?.status === 403) {
                    setMessage('Authorization error: please sign in again.');
                } else {
                    setMessage(`Error placing order: ${error.message}`);
                }
            });
    };

    return (
        <div className="dashboard-grid">
            <section className="dashboard-surface">
                <div className="page-header">
                    <div>
                        <span className="eyebrow">Client workspace</span>
                        <h1 className="page-title">Create an order</h1>
                        <p className="page-lead" style={{ marginBottom: 0 }}>
                            Address search, cafe selection, menu browsing, and checkout are now combined into one continuous user flow.
                        </p>
                    </div>
                    <Link to="/user-orders" className="btn btn--secondary">Open order history</Link>
                </div>

                <div className="form-grid form-grid--two">
                    <div className="field">
                        <label htmlFor="order-address">Delivery address</label>
                        <input
                            id="order-address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter street, house, district"
                        />
                        <span className="field-hint">The backend still resolves available cafes by address.</span>
                    </div>
                    <div className="field" style={{ justifyContent: 'flex-end' }}>
                        <label style={{ opacity: 0 }}>Action</label>
                        <button onClick={handleGetCafeByAddress} disabled={loadingCafe}>
                            {loadingCafe ? 'Searching cafes...' : 'Find cafes'}
                        </button>
                    </div>
                </div>

                {(error || message) && (
                    <div style={{ marginTop: '18px' }}>
                        {error && <div className="feedback-banner error">{error}</div>}
                        {message && <div className={`feedback-banner ${message.toLowerCase().includes('success') ? 'success' : 'info'}`}>{message}</div>}
                    </div>
                )}

                <div className="subtle-divider" />

                <div className="section-header">
                    <div>
                        <h2 className="section-title">Available cafes</h2>
                        <p className="section-copy" style={{ marginBottom: 0 }}>
                            When several cafes are available for the same address, the user can choose explicitly.
                        </p>
                    </div>
                    <div className="role-chip">{cafes.length} found</div>
                </div>

                {cafes.length === 0 ? (
                    <div className="empty-state">
                        <strong>No cafe selected yet</strong>
                        <p style={{ margin: 0 }}>Enter an address and run the search to unlock menu selection.</p>
                    </div>
                ) : (
                    <div className="menu-grid">
                        {cafes.map((cafe) => (
                            <button
                                key={cafe.id}
                                type="button"
                                className={`role-panel ${Number(selectedCafeId) === Number(cafe.id) ? 'role-panel--active' : ''}`}
                                onClick={() => setSelectedCafeId(cafe.id)}
                                style={{ textAlign: 'left' }}
                            >
                                <div>
                                    <div className="role-panel__icon">☕</div>
                                    <strong>{cafe.name}</strong>
                                    <p className="list-note" style={{ marginBottom: 0 }}>{cafe.email}</p>
                                </div>
                                <div className="badge-row">
                                    <span className="surface-badge">District: {cafe.district || '—'}</span>
                                    <span className="surface-badge">ID: {cafe.id}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {selectedCafe && (
                    <>
                        <div className="subtle-divider" />

                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Menu of {selectedCafe.name}</h2>
                                <p className="section-copy" style={{ marginBottom: 0 }}>
                                    Product cards now present menu items visually instead of plain text rows.
                                </p>
                            </div>
                            <span className="surface-badge">{menuItems.length} items</span>
                        </div>

                        {menuItems.length === 0 ? (
                            <div className="empty-state">
                                <strong>Menu is empty</strong>
                                <p style={{ margin: 0 }}>No menu items are currently available for the selected cafe.</p>
                            </div>
                        ) : (
                            <div className="menu-grid">
                                {menuItems.map((item) => (
                                    <article key={item.id} className="menu-card">
                                        <div className="menu-card__media">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} />
                                            ) : (
                                                <div className="menu-card__placeholder">🍽️</div>
                                            )}
                                        </div>
                                        <div className="card-stack">
                                            <div>
                                                <strong>{item.name}</strong>
                                                <p className="list-note" style={{ marginBottom: 0 }}>
                                                    {item.description || 'Menu item without description.'}
                                                </p>
                                            </div>
                                            <div className="card-actions">
                                                <span className="price-chip">${item.price}</span>
                                                <button type="button" className="btn btn--secondary" onClick={() => handleSelectItem(item)}>
                                                    Add to cart
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>

            <aside className="checkout-card">
                <div>
                    <span className="eyebrow">Checkout</span>
                    <h2 className="section-title" style={{ marginTop: '10px', marginBottom: '10px' }}>Order details</h2>
                    <p className="section-copy" style={{ marginBottom: 0 }}>
                        User data, cart control, and submission are grouped into one compact summary area.
                    </p>
                </div>

                <div className="form-grid">
                    <div className="field">
                        <label htmlFor="client-name">Client name</label>
                        <input id="client-name" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Recipient name" />
                    </div>
                    <div className="field">
                        <label htmlFor="client-phone">Phone number</label>
                        <input id="client-phone" type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Digits only" />
                    </div>
                </div>

                <div className="summary-card">
                    <strong>Selected cafe</strong>
                    <p className="list-note" style={{ margin: 0 }}>
                        {selectedCafe ? `${selectedCafe.name} • ${selectedCafe.email}` : 'Select a cafe after address lookup.'}
                    </p>
                </div>

                <div className="summary-card">
                    <div className="section-header" style={{ marginBottom: '12px' }}>
                        <div>
                            <strong>Cart</strong>
                            <p className="list-note" style={{ margin: 0 }}>Change quantities directly from the summary.</p>
                        </div>
                        <span className="surface-badge">{selectedItems.length} items</span>
                    </div>

                    {selectedItems.length === 0 ? (
                        <div className="empty-state">
                            <strong>Cart is empty</strong>
                            <p style={{ margin: 0 }}>Add menu items to prepare the order.</p>
                        </div>
                    ) : (
                        <ul className="cart-list">
                            {selectedItems.map((item) => (
                                <li key={item.id} className="list-card">
                                    <div className="cart-row">
                                        <div>
                                            <strong>{item.name}</strong>
                                            <p className="list-note" style={{ margin: 0 }}>${item.price} per item</p>
                                        </div>
                                        <div className="quantity-control">
                                            <button type="button" className="btn btn--secondary" onClick={() => changeQuantity(item.id, -1)}>−</button>
                                            <span className="quantity-pill">{item.quantity}</span>
                                            <button type="button" className="btn btn--secondary" onClick={() => changeQuantity(item.id, 1)}>+</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="summary-total">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                <button type="button" onClick={handleSubmitOrder}>Submit order</button>
            </aside>
        </div>
    );
};

export default ClientOrder;
