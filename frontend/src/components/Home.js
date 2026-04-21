import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const { isAuthenticated, userRole } = useAuth();

    const primaryRoute = !isAuthenticated
        ? '/login'
        : userRole === 'CAFE'
            ? '/cafe-admin'
            : userRole === 'COURIER'
                ? '/courier-dashboard'
                : '/client-order';

    const primaryLabel = !isAuthenticated
        ? 'Open platform'
        : userRole === 'CAFE'
            ? 'Open cafe admin'
            : userRole === 'COURIER'
                ? 'Open courier dashboard'
                : 'Create order';

    return (
        <div className="home-page">


            <section className="page-section" style={{ marginTop: '24px' }}>
                <div className="section-header">
                    <div>
                        <span className="eyebrow">Role entry points</span>
                        <h2 className="section-title">Start from the correct workflow</h2>
                        <p className="section-copy" style={{ marginBottom: 0 }}>
                            Each role now has a dedicated entry with explicit purpose instead of forcing every persona through the same generic screen.
                        </p>
                    </div>
                </div>

                <div className="role-grid">
                    <article className="role-panel">
                        <div>
                            <div className="role-panel__icon">🛒</div>
                            <strong>Client</strong>
                            <p className="list-note">Find cafe by address, browse menu, build cart, submit order, then track history.</p>
                        </div>
                        <div className="card-actions">
                            <Link to="/login" className="btn">Client login</Link>
                            <Link to="/register" className="btn btn--secondary">Client sign up</Link>
                        </div>
                    </article>

                    <article className="role-panel">
                        <div>
                            <div className="role-panel__icon">🛵</div>
                            <strong>Courier</strong>
                            <p className="list-note">See fresh orders, accept deliveries, monitor assigned orders, and open map links directly from the dashboard.</p>
                        </div>
                        <div className="card-actions">
                            <Link to="/courier-login" className="btn">Courier login</Link>
                            <Link to="/register-courier" className="btn btn--secondary">Courier sign up</Link>
                        </div>
                    </article>

                    <article className="role-panel">
                        <div>
                            <div className="role-panel__icon">☕</div>
                            <strong>Cafe</strong>
                            <p className="list-note">Manage menu, configure delivery zones, and operate the order intake process from one control center.</p>
                        </div>
                        <div className="card-actions">
                            <Link to="/login" className="btn">Cafe login</Link>
                            <Link to="/register-cafe" className="btn btn--secondary">Cafe sign up</Link>
                        </div>
                    </article>
                </div>
            </section>


        </div>
    );
}

export default Home;
