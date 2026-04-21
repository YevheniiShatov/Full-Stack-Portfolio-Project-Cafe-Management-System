import React from 'react';
import { Link } from 'react-router-dom';

const PortalAuthLayout = ({
    title,
    subtitle,
    mode,
    accentTitle,
    accentText,
    switchLabel,
    switchTo,
    children,
    footerNote,
}) => {
    return (
        <div className="portal-auth-screen">
            <div className="portal-auth-card">
                <section className="portal-auth-card__form-side">
                    <div className="portal-auth-card__content">
                        <div className="portal-auth-card__header">
                            <span className="portal-auth-card__eyebrow">{mode} portal</span>
                            <h1>{title}</h1>
                            {subtitle && <p>{subtitle}</p>}
                        </div>

                        {children}

                        {footerNote && <div className="portal-auth-card__note">{footerNote}</div>}
                    </div>
                </section>

                <aside className="portal-auth-card__accent-side">
                    <div className="portal-auth-card__accent-content">
                        <span className="portal-auth-card__mode">{mode}</span>
                        <h2>{accentTitle}</h2>
                        <p>{accentText}</p>
                        <Link to={switchTo} className="portal-auth-card__switch-btn">
                            {switchLabel}
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default PortalAuthLayout;
