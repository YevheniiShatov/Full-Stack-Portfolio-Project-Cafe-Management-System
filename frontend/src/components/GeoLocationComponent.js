import React, { useState } from 'react';
import axios from 'axios';

const GeoLocationComponent = () => {
    const [address, setAddress] = useState('');
    const [cafe, setCafe] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGetCafeByAddress = async () => {
        if (!address.trim()) {
            setError('Please enter an address.');
            return;
        }

        setLoading(true);
        setError('');
        setCafe(null);

        try {
            const response = await axios.post(
                'http://localhost:8080/api/geo/address',
                { address }   // JSON
            );
            setCafe(response.data);
        } catch (err) {
            console.error("❌ Ошибка при поиске кафе:", err);
            setError('Error during the request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Find a Cafe by Address</h2>
            <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                style={{ width: '300px', marginBottom: '10px', padding: '5px' }}
            />
            <button onClick={handleGetCafeByAddress} disabled={loading}>
                {loading ? 'Searching...' : 'Find Cafe'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {cafe && (
                <div style={{ marginTop: '15px' }}>
                    <p><b>{cafe.name}</b> ({cafe.email})</p>
                    {cafe.district && <p>Delivery district: {cafe.district}</p>}
                </div>
            )}
        </div>
    );
};

export default GeoLocationComponent;
