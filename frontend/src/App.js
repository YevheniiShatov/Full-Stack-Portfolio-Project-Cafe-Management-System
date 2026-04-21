import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import ClientOrder from './components/ClientOrder';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import CourierRequest from './components/CourierRequest';
import CafeOrders from './components/CafeOrders';
import Logout from './components/Logout';
import UserOrders from './components/UserOrders';
import RegisterCourierForm from './components/RegisterCourierForm';
import CourierLoginForm from './components/CourierLoginForm';
import CourierOrders from './components/CourierOrders';
import RegisterCafeForm from './components/RegisterCafeForm';
import CafeAdminDashboard from './components/CafeAdminDashboard';
import CafeLoginForm from './components/CafeLoginForm';
import './App.css';
import { authStorage } from './utils/authStorage';
import { PORTAL, PORTAL_META } from './config/portal';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const LoginScreen = () => {
    if (PORTAL === 'courier') return <CourierLoginForm />;
    if (PORTAL === 'cafe') return <CafeLoginForm />;
    return <LoginForm />;
};

const RegisterScreen = () => {
    if (PORTAL === 'courier') return <RegisterCourierForm />;
    if (PORTAL === 'cafe') return <RegisterCafeForm />;
    return <RegisterForm />;
};

const PrivateRoute = ({ element, allowedRoles }) => {
    const { isAuthenticated, userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to={PORTAL_META.loginRoute} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to={PORTAL_META.afterLoginRoute} replace />;
    }

    return element;
};

const getRouteMeta = (pathname) => {
    const routeMap = {
        '/login': {
            title: `${PORTAL_META.label} login`,
            subtitle: `Dedicated authentication window for the ${PORTAL_META.label.toLowerCase()} role.`,
        },
        '/register': {
            title: `${PORTAL_META.label} registration`,
            subtitle: `Dedicated registration window for the ${PORTAL_META.label.toLowerCase()} role.`,
        },
        [PORTAL_META.dashboardRoute]: {
            title: `${PORTAL_META.label} workspace`,
            subtitle: PORTAL_META.portalSubtitle,
        },
    };

    if (PORTAL_META.secondaryRoute) {
        routeMap[PORTAL_META.secondaryRoute] = {
            title: `${PORTAL_META.label} ${PORTAL_META.secondaryLabel.toLowerCase()}`,
            subtitle: PORTAL_META.portalSubtitle,
        };
    }

    if (routeMap[pathname]) {
        return routeMap[pathname];
    }

    return {
        title: PORTAL_META.portalLabel,
        subtitle: PORTAL_META.portalSubtitle,
    };
};

const AppFrame = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const routeMeta = getRouteMeta(location.pathname);
    const isAuthRoute = ['/login', '/register'].includes(location.pathname);

    const navItems = [
        { to: PORTAL_META.dashboardRoute, label: PORTAL_META.dashboardLabel },
        ...(PORTAL_META.secondaryRoute ? [{ to: PORTAL_META.secondaryRoute, label: PORTAL_META.secondaryLabel }] : []),
    ];

    return (
        <div className="app-shell">
            <div className="app-orb app-orb--one" />
            <div className="app-orb app-orb--two" />

            {!isAuthRoute && (
                <header className="app-topbar app-topbar--workspace">
                    <div className="app-topbar__brand-group">
                        <Link to={PORTAL_META.afterLoginRoute} className="brand-mark">CafeFlow</Link>
                        <div className="app-topbar__meta">
                            <span className="eyebrow">{PORTAL_META.portalLabel}</span>
                            <strong>{routeMeta.title}</strong>
                            <span>{routeMeta.subtitle}</span>
                        </div>
                    </div>

                    <div className="app-topbar__right">
                        {isAuthenticated && (
                            <>
                                <nav className="app-nav">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={`app-nav__link ${location.pathname === item.to ? 'is-active' : ''}`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                    <Link to="/logout" className="app-nav__link app-nav__link--ghost">
                                        Logout
                                    </Link>
                                </nav>
                                <div className="role-chip">{PORTAL_META.label.toUpperCase()}</div>
                            </>
                        )}
                    </div>
                </header>
            )}

            <main className={`app-main ${isAuthRoute ? 'app-main--auth-clean' : 'app-main--auth-flow'}`}>
                <Routes>
                    <Route path="/" element={<Navigate to={isAuthenticated ? PORTAL_META.afterLoginRoute : PORTAL_META.loginRoute} replace />} />
                    <Route path="/login" element={isAuthenticated ? <Navigate to={PORTAL_META.afterLoginRoute} replace /> : <LoginScreen />} />
                    <Route path="/register" element={isAuthenticated ? <Navigate to={PORTAL_META.afterLoginRoute} replace /> : <RegisterScreen />} />
                    <Route path="/logout" element={<Logout />} />

                    {PORTAL === 'user' && (
                        <>
                            <Route path="/client-order" element={<PrivateRoute element={<ClientOrder />} allowedRoles={['USER']} />} />
                            <Route path="/user-orders" element={<PrivateRoute element={<UserOrders />} allowedRoles={['USER']} />} />
                        </>
                    )}

                    {PORTAL === 'courier' && (
                        <>
                            <Route path="/courier-dashboard" element={<PrivateRoute element={<CourierOrders />} allowedRoles={['COURIER']} />} />
                            <Route path="/courier" element={<PrivateRoute element={<CourierRequest />} allowedRoles={['COURIER']} />} />
                        </>
                    )}

                    {PORTAL === 'cafe' && (
                        <>
                            <Route path="/cafe-orders" element={<PrivateRoute element={<CafeOrders />} allowedRoles={['CAFE']} />} />
                            <Route path="/cafe-admin" element={<PrivateRoute element={<CafeAdminDashboard />} allowedRoles={['CAFE']} />} />
                        </>
                    )}

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [cafeId, setCafeId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = authStorage.getToken();
        const role = authStorage.getRole();
        const storedCafeId = authStorage.getCafeId();

        if (token && role && role === PORTAL_META.role) {
            setIsAuthenticated(true);
            setUserRole(role);
            setCafeId(storedCafeId || null);
        } else if (token || role || storedCafeId) {
            authStorage.clear();
        }

        setLoading(false);
    }, []);

    const login = (token, role, cafeIdValue) => {
        authStorage.setToken(token);
        authStorage.setRole(role);
        authStorage.setCafeId(cafeIdValue);
        setIsAuthenticated(true);
        setUserRole(role);
        setCafeId(cafeIdValue || null);
    };

    const logout = () => {
        authStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
        setCafeId(null);
    };

    const authContextValue = { isAuthenticated, userRole, cafeId, login, logout };

    if (loading) {
        return (
            <div className="screen-center">
                <div className="loading-card">
                    <div className="loading-spinner" />
                    <strong>Preparing interface</strong>
                    <span>Restoring session and role context.</span>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            <Router>
                <AppFrame />
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
