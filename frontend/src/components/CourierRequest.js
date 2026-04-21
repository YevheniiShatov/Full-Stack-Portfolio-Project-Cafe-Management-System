import React, { useState } from 'react';
import axios from 'axios';
import { authStorage } from '../utils/authStorage';

function CourierRequest() {
    const [status, setStatus] = useState('');

    const requestCourierRole = async () => {
        try {
            const token = authStorage.getToken();
            await axios.post('http://localhost:8080/api/courier/request', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStatus('You are now a courier.');
        } catch (error) {
            setStatus('Error requesting courier role.');
        }
    };

    return (
        <div className="page-section">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Compatibility flow</span>
                    <h1 className="page-title">Courier role request</h1>
                    <p className="page-lead" style={{ marginBottom: 0 }}>Legacy role request kept compatible, but redesigned to fit the new system.</p>
                </div>
            </div>

            <div className="summary-card">
                <strong>Become a courier</strong>
                <p className="list-note">This screen preserves the existing endpoint and wraps it in a product-like action panel.</p>
                <div className="form-actions">
                    <button type="button" onClick={requestCourierRole}>Request courier role</button>
                </div>
                {status && <div className={`feedback-banner ${status.toLowerCase().includes('error') ? 'error' : 'success'}`}>{status}</div>}
            </div>
        </div>
    );
}

export default CourierRequest;
