import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GeoLocationOrder = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch menu items
        axios.get('http://localhost:8080/api/menu')
            .then(response => setMenuItems(response.data))
            .catch(error => console.log('Error loading menu:', error));
    }, []);

    const handleSelectItem = (item) => {
        setSelectedItems([...selectedItems, item.id]);
    };

    const handleSubmitOrder = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // Submit the order with coordinates
                    axios.post('http://localhost:8080/api/orders', {
                        items: selectedItems,
                        lat: latitude,
                        lon: longitude
                    })
                        .then(() => setMessage('Order placed successfully!'))
                        .catch(() => setMessage('Error placing the order.'));
                },
                () => {
                    setMessage('Unable to retrieve your location.');
                }
            );
        } else {
            setMessage('Your browser does not support geolocation.');
        }
    };

    return (
        <div>
            <h2>Place an Order</h2>
            <ul>
                {menuItems.map(item => (
                    <li key={item.id}>
                        {item.name} - ${item.price}
                        <button onClick={() => handleSelectItem(item)}>Add</button>
                    </li>
                ))}
            </ul>
            <button onClick={handleSubmitOrder}>Submit Order</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default GeoLocationOrder;
