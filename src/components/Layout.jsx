import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import Toasts from './Toasts.jsx';
import { useShop } from '../context/ShopContext.jsx';

function NbLogo() {
    return <span className="nb-logo" aria-label="New Balance Shop">NB</span>;
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
            <div className="announce">{t('nb.freeShip')}</div>
            <header className="header">
                <div className="header-inner">
                    <Link to="/" className="brand" aria-label={t('brand.title')}><NbLogo /></Link>
                    <nav className="nav" aria-label="main">
                        <NavLink to="/?new=1" className="nav-btn">{t('nb.new')}</NavLink>
                        <NavLink to="/?g=men" className="nav-btn">{t('nb.men')}</NavLink>
                        <NavLink to="/?g=women" className="nav-btn">{t('nb.women')}</NavLink>
                        <NavLink to="/?g=kids" className="nav-btn">{t('nb.kids')}</NavLink>
                        <NavLink to="/?sale=1" className="nav-btn nav-sale">{t('nb.sale')}</NavLink>
                    </nav>
                    <div className="header-actions">
                        <LanguageSwitcher />
                        <form className="head-search" onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get('q'); navigate(`/?q=${encodeURIComponent(String(q || '').trim())}`); }}>
                            <input name="q" type="search" placeholder={t('catalog.search')} aria-label={t('catalog.search')} />
                        </form>
                        <Link className="icon-link" to="/fav" aria-label={t('nav.favorites')}>
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 20.5s-8-4.9-8-11A4.6 4.6 0 0 1 8.6 5c1.5 0 2.7.7 3.4 1.8C12.7 5.7 13.9 5 15.4 5A4.6 4.6 0 0 1 20 9.5c0 6.1-8 11-8 11z" /></svg>
                            {favorites.length > 0 && <span className="dot-count">{favorites.length}</span>}
                        </Link>
                        {customer ? (
                            <div className="account" ref={menuRef}>
                                <button className="icon-link" onClick={() => setMenuOpen((v) => !v)} aria-label={t('nav.account')} aria-expanded={menuOpen}>
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
                            <Link className="icon-link login-link" to="/login" state={{ from: location.pathname }}>
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" /></svg>
                                <span>{t('nav.login')}</span>
                            </Link>
                        )}
                        <Link className="icon-link" to="/cart" aria-label={t('cart.title')}>
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" /></svg>
                            {cartCount > 0 && <span className="dot-count">{cartCount}</span>}
                        </Link>
                    </div>
                </div>
            </header>

            <Outlet />

            <footer className="footer">
                <div className="footer-inner">
                    <div className="foot-cols">
                        <div><h4>Shop</h4><Link to="/?g=men">{t('nb.men')}</Link><Link to="/?g=women">{t('nb.women')}</Link><Link to="/?g=kids">{t('nb.kids')}</Link><Link to="/?sale=1">{t('nb.sale')}</Link></div>
                        <div><h4>{t('nav.account')}</h4><Link to="/account">{t('nav.account')}</Link><Link to="/orders">{t('nav.orders')}</Link><Link to="/fav">{t('nav.favorites')}</Link><Link to="/cart">{t('cart.title')}</Link></div>
                        <div><h4>Info</h4><span>{t('nb.freeShip')}</span></div>
                    </div>
                    
                </div>
            </footer>
            <Toasts />
        </div>
    );
}
