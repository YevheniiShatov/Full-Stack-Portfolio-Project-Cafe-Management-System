import React, { useState } from 'react';
import axios from 'axios';
import PortalAuthLayout from './PortalAuthLayout';
import { apiUrl } from '../utils/api';
import { PORTAL_META } from '../config/portal';

const RegisterCourierForm = () => {
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
            const response = await axios.post(apiUrl('/api/auth/register-courier'), {
                email,
                password,
                name,
            });

            if (response.status === 200) {
                setSuccess('Courier registration completed. You can sign in now.');
                setName('');
                setEmail('');
                setPassword('');
            }
        } catch (error) {
            setError('Courier registration failed. Please try again.');
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
            footerNote="After registration, continue to login in this courier portal."
        >
            <form onSubmit={handleSubmit} className="portal-auth-form">
                <div className="portal-auth-field">
                    <label htmlFor="courier-name">Name</label>
                    <input id="courier-name" type="text" placeholder="Courier full name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="portal-auth-field">
                    <label htmlFor="courier-email">Email</label>
                    <input id="courier-email" type="email" placeholder="courier@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="portal-auth-field">
                    <label htmlFor="courier-password">Password</label>
                    <input id="courier-password" type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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

export default RegisterCourierForm;
