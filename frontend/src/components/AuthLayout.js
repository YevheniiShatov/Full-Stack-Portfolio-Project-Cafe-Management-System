import React from 'react';

const AuthLayout = ({ eyebrow, title, description, children, sideTitle, sideText, highlights = [] }) => {
    return (
        <div className="auth-page">
            <section className="auth-card">
                <div>
                    <span className="eyebrow">{eyebrow}</span>
                    <h1 className="page-title" style={{ marginTop: '10px', marginBottom: '10px' }}>{title}</h1>
                    <p className="page-lead" style={{ margin: 0 }}>{description}</p>
                </div>
                {children}
            </section>

            {sideTitle && (
                <aside className="auth-panel">
                    <span className="eyebrow">Why this flow</span>
                    <h2 className="section-title" style={{ marginTop: '10px', marginBottom: '10px' }}>
                        {sideTitle}
                    </h2>
                    <p className="section-copy" style={{ marginTop: 0 }}>
                        {sideText}
                    </p>

                    {highlights?.length > 0 && (
                        <div className="auth-highlights">
                            {highlights.map((item) => (
                                <div key={item.title} className="highlight-item">
                                    <strong>{item.title}</strong>
                                    <p className="list-note" style={{ margin: 0 }}>
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            )}
        </div>
    );
};

export default AuthLayout;
