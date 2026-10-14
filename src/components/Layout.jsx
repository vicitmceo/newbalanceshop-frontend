import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import Toasts from './Toasts.jsx';
import { useShop } from '../context/ShopContext.jsx';

function BrandMark() {
    return (
        <svg className="brand-mark" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="40" height="40" rx="8" fill="var(--nb-black)" />
            <path d="M10 30V10h5.2l9.6 13.6V10H30v20h-5.2L15.2 16.4V30H10z" fill="var(--nb-red)" />
        </svg>
    );
}

export default function Layout() {
    const { t } = useTranslation();
    const { customer, cartCount, favorites, logout, notify } = useShop();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // GitHub після входу повертає на сайт з ?ghcode=... (одноразовий код) або ?githubError=...:
    // обмінюємо код на сесію через наш домен, показуємо результат і чистимо адресу
    const { loginGithub } = useShop();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('ghcode');
        if (code) {
            loginGithub(code)
                .then((me) => notify(t('auth.welcome', { name: me.fullName }), 'success'))
                .catch(() => notify(t('auth.githubFailed'), 'error'));
        } else if (params.has('githubError')) {
            notify(params.get('githubError') === 'account_blocked' ? t('auth.blocked') : t('auth.githubFailed'), 'error');
        } else {
            return;
        }
        params.delete('ghcode');
        params.delete('githubLogin');
        params.delete('githubError');
        const query = params.toString();
        navigate(location.pathname + (query ? `?${query}` : ''), { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    useEffect(() => { setMenuOpen(false); window.scrollTo(0, 0); }, [location.pathname]);

    useEffect(() => {
        const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    const doLogout = async () => {
        await logout();
        setMenuOpen(false);
        notify(t('auth.loggedOut'), 'info');
        navigate('/');
    };

    const navClass = ({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`;

    return (
        <div className="app">
            <header className="header">
                <div className="header-inner">
                    <Link to="/" className="brand" aria-label={t('brand.title')}>
                        <BrandMark />
                        <span className="brand-title">{t('brand.title')}</span>
                    </Link>
                    <nav className="nav" aria-label="main">
                        <NavLink to="/" end className={navClass}>{t('nav.catalog')}</NavLink>
                        <NavLink to="/fav" className={navClass}>
                            {t('nav.favorites')}{favorites.length > 0 && <span className="nav-count">{favorites.length}</span>}
                        </NavLink>
                        <NavLink to="/orders" className={navClass}>{t('nav.orders')}</NavLink>
                        {customer?.isAdmin && <NavLink to="/admin" className={navClass}>{t('nav.admin')}</NavLink>}
                    </nav>
                    <div className="header-actions">
                        <LanguageSwitcher />

                        {customer ? (
                            <div className="account" ref={menuRef}>
                                <button
                                    className="icon-toggle is-signed-in"
                                    onClick={() => setMenuOpen((v) => !v)}
                                    aria-label={t('nav.account')}
                                    aria-expanded={menuOpen}
                                >
                                    <span className="avatar-initial">{(customer.fullName || customer.email || '?').trim()[0].toUpperCase()}</span>
                                </button>
                                {menuOpen && (
                                    <div className="account-menu">
                                        <div className="account-who">
                                            <span className="account-name">{customer.fullName}</span>
                                            <span className="account-mail">{customer.email}</span>
                                            {customer.isAdmin && <span className="role-badge">{t('account.roleAdmin')}</span>}
                                        </div>
                                        <div className="account-divider" />
                                        <Link className="menu-link" to="/account">{t('nav.account')}</Link>
                                        <Link className="menu-link" to="/orders">{t('nav.orders')}</Link>
                                        <Link className="menu-link" to="/fav">{t('nav.favorites')}</Link>
                                        {customer.isAdmin && <Link className="menu-link" to="/admin">{t('nav.admin')}</Link>}
                                        <div className="account-divider" />
                                        <button className="menu-link menu-button" onClick={doLogout}>{t('auth.logout')}</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link className="btn btn-primary btn-small" to="/login" state={{ from: location.pathname }}>{t('nav.login')}</Link>
                        )}

                        <Link className="cart-badge" to="/cart" aria-label={t('cart.title')}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="9" cy="20" r="1.4" />
                                <circle cx="18" cy="20" r="1.4" />
                                <path d="M2.5 3h2l2.2 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {cartCount}
                        </Link>
                    </div>
                </div>
            </header>

            <Outlet />

            <footer className="footer">
                <div className="footer-inner">
                    <span>{t('footer')}</span>
                </div>
            </footer>
            <Toasts />
        </div>
    );
}
