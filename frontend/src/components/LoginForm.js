import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PortalAuthLayout from './PortalAuthLayout';
import { authStorage } from '../utils/authStorage';
import { apiUrl } from '../utils/api';
import { useAuth } from '../App';
import { PORTAL_META } from '../config/portal';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post(apiUrl('/api/auth/login'), { email, password });
            const token = data.token;
            const role = (data.user?.role || '').toUpperCase() || 'USER';

            if (role !== 'USER') {
                setError('This portal accepts only client accounts.');
                return;
            }

            authStorage.setToken(token);
            authStorage.setUserEmail(data.user?.email || email);
            authStorage.setRole('USER');
            authStorage.setCafeId(null);
            login(token, 'USER', null);
            navigate(PORTAL_META.afterLoginRoute);
        } catch (err) {
            if ([401, 403].includes(err.response?.status)) {
                setError('Invalid email or password.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PortalAuthLayout
            title={PORTAL_META.loginTitle}
            subtitle={PORTAL_META.loginSubtitle}
            mode={PORTAL_META.label}
            accentTitle={PORTAL_META.loginAccentTitle}
            accentText={PORTAL_META.loginAccentText}
            switchLabel={PORTAL_META.switchToRegisterLabel}
            switchTo={PORTAL_META.registerRoute}
            footerNote="Use the client account created through registration in this portal."
        >
            <form onSubmit={handleSubmit} className="portal-auth-form">
                <div className="portal-auth-field">
                    <label htmlFor="client-login-email">Email</label>
                    <input
                        id="client-login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="portal-auth-field">
                    <label htmlFor="client-login-password">Password</label>
                    <input
                        id="client-login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                    />
                </div>

                {error && <div className="portal-auth-alert portal-auth-alert--error">{error}</div>}

                <button type="submit" className="portal-auth-submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Login'}
                </button>
            </form>
        </PortalAuthLayout>
    );
};

export default LoginForm;
