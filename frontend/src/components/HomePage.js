import React from 'react';
import { Link } from 'react-router-dom';
import GeoLocationComponent from './GeoLocationComponent';

const HomePage = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to the Cafe App</h1>
            <GeoLocationComponent />
            <p>Please login or register to continue</p>
            <div>
                <Link to="/login">
                    <button style={{ marginRight: '20px' }}>Login</button>
                </Link>
                <Link to="/register">
                    <button>Register</button>
                </Link>
                <br />
                {/* Button to view order history */}
                <Link to="/user-orders">
                    <button style={{ marginTop: '20px' }}>Order History</button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
