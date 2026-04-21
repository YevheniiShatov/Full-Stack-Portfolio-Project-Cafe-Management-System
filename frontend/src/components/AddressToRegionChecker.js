import React, { useState } from 'react';
import axios from 'axios';

const AddressToRegionChecker = () => {
    const [address, setAddress] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    // Function to handle checking the region for the provided address
    const handleCheckRegion = async () => {
        try {
            const response = await axios.post(
                'http://localhost:8080/api/geo/address',
                { address } // <-- JSON
            );
            setResult(response.data);
            setError('');
        } catch (error) {
            setError('Error processing the address');
            setResult('');
        }
    };


    return (
        <div>
            <h2>Check Region by Address</h2>
            <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
            />
            <button onClick={handleCheckRegion}>Check</button>
            {result && <p>Result: {result}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default AddressToRegionChecker;
