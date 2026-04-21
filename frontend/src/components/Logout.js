import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App'; // Import useAuth from App.js

const Logout = () => {
    const { logout } = useAuth(); // Use the logout function from context
    const navigate = useNavigate();

    useEffect(() => {
        logout(); // Perform logout
        navigate('/login'); // Redirect to login page
    }, [logout, navigate]);

    return null; // Component renders nothing
};

export default Logout;
