import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PortalAuthLayout from './PortalAuthLayout';
import { authStorage } from '../utils/authStorage';
import { apiUrl } from '../utils/api';
import { useAuth } from '../App';
import { PORTAL_META } from '../config/portal';

const CafeLoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data } = await axios.post(apiUrl('/api/auth/login-cafe'), {
                email,
                password,
            });

            const token = data.token;
            const cafeId = data.cafeId ?? null;

            login(token, 'CAFE', cafeId);
            authStorage.setToken(token);
            authStorage.setUserEmail(data.user?.email || email);
            authStorage.setRole('CAFE');
            authStorage.setCafeId(cafeId);

            navigate(PORTAL_META.afterLoginRoute);
        } catch (err) {
            if ([401, 403].includes(err.response?.status)) {
                setError('Invalid cafe credentials.');
            } else {
                setError('Cafe login failed.');
            }
        } finally {
            setIsLoading(false);
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
            footerNote="Use the cafe account created through registration in this portal."
        >
            <form onSubmit={handleSubmit} className="portal-auth-form">
                <div className="portal-auth-field">
                    <label htmlFor="cafe-login-email">Email</label>
                    <input
                        id="cafe-login-email"
                        type="email"
                        placeholder="owner@cafe.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="portal-auth-field">
                    <label htmlFor="cafe-login-password">Password</label>
                    <input
                        id="cafe-login-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <div className="portal-auth-alert portal-auth-alert--error">{error}</div>}

                <button type="submit" className="portal-auth-submit" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Login'}
                </button>
            </form>
        </PortalAuthLayout>
    );
};

export default CafeLoginForm;
