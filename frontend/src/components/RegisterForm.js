import React, { useState } from 'react';
import axios from 'axios';
import PortalAuthLayout from './PortalAuthLayout';
import { apiUrl } from '../utils/api';
import { PORTAL_META } from '../config/portal';

const RegisterForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(apiUrl('/api/auth/register'), { name, email, password });
            setSuccess('Client account created successfully. You can sign in now.');
            setName('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err.response ? 'Registration failed. Please check the entered data.' : 'Server is unavailable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PortalAuthLayout
            title={PORTAL_META.registerTitle}
            subtitle={PORTAL_META.registerSubtitle}
            mode={PORTAL_META.label}
            accentTitle={PORTAL_META.registerAccentTitle}
            accentText={PORTAL_META.registerAccentText}
            switchLabel={PORTAL_META.switchToLoginLabel}
            switchTo={PORTAL_META.loginRoute}
            footerNote="After registration, continue directly to login in this client portal."
        >
            <form onSubmit={handleSubmit} className="portal-auth-form">
                <div className="portal-auth-field">
                    <label htmlFor="client-register-name">Name</label>
                    <input
                        id="client-register-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                    />
                </div>

                <div className="portal-auth-field">
                    <label htmlFor="client-register-email">Email</label>
                    <input
                        id="client-register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="portal-auth-field">
                    <label htmlFor="client-register-password">Password</label>
                    <input
                        id="client-register-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        required
                    />
                </div>

                {error && <div className="portal-auth-alert portal-auth-alert--error">{error}</div>}
                {success && <div className="portal-auth-alert portal-auth-alert--success">{success}</div>}

                <button type="submit" className="portal-auth-submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Signup'}
                </button>
            </form>
        </PortalAuthLayout>
    );
};

export default RegisterForm;
