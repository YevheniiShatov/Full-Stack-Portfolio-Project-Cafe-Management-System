import React, { useState } from 'react';
import axios from 'axios';
import PortalAuthLayout from './PortalAuthLayout';
import { apiUrl } from '../utils/api';
import { PORTAL_META } from '../config/portal';

const RegisterCafeForm = () => {
    const [cafeName, setCafeName] = useState('');
    const [ownerName, setOwnerName] = useState('');
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
            const response = await axios.post(apiUrl('/api/auth/register-cafe'), {
                cafeName,
                ownerName,
                email,
                password,
            });

            if (response.status === 200) {
                setSuccess('Cafe registration completed. You can sign in now.');
                setCafeName('');
                setOwnerName('');
                setEmail('');
                setPassword('');
            }
        } catch (error) {
            setError('Cafe registration failed. Please try again.');
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
            footerNote="After registration, continue to login in this cafe portal."
        >
            <form onSubmit={handleSubmit} className="portal-auth-form portal-auth-form--two-column">
                <div className="portal-auth-field">
                    <label htmlFor="cafe-name">Cafe name</label>
                    <input id="cafe-name" type="text" placeholder="Cafe name" value={cafeName} onChange={(e) => setCafeName(e.target.value)} required />
                </div>

                <div className="portal-auth-field">
                    <label htmlFor="owner-name">Owner name</label>
                    <input id="owner-name" type="text" placeholder="Owner name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                </div>

                <div className="portal-auth-field">
                    <label htmlFor="cafe-email">Business email</label>
                    <input id="cafe-email" type="email" placeholder="owner@cafe.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="portal-auth-field">
                    <label htmlFor="cafe-password">Password</label>
                    <input id="cafe-password" type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                {error && <div className="portal-auth-alert portal-auth-alert--error portal-auth-alert--full">{error}</div>}
                {success && <div className="portal-auth-alert portal-auth-alert--success portal-auth-alert--full">{success}</div>}

                <button type="submit" className="portal-auth-submit portal-auth-submit--full" disabled={loading}>
                    {loading ? 'Loading...' : 'Signup'}
                </button>
            </form>
        </PortalAuthLayout>
    );
};

export default RegisterCafeForm;
