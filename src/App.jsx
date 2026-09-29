import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
import GoogleLoginButton from './components/GoogleLoginButton.jsx';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://newbalanceshop-api.onrender.com';

async function api(path, options = {}, lang) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(lang ? { 'Accept-Language': lang } : {}) },
        ...options,
    });
    if (!response.ok) throw new Error(String(response.status));
    if (response.status === 204) return null;
    return response.json();
}

export default function App() {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('catalog');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [customerId, setCustomerId] = useState(1);
    const [githubUser, setGithubUser] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [brokenImages, setBrokenImages] = useState({});

    const loadProducts = useCallback(async () => {
        try {
            const data = await api('/api/Products', {}, i18n.language);
            setProducts(data);
        } catch (err) {
            setError(err.message);
        }
    }, [i18n.language]);

    const loadCart = useCallback(async () => {
        try {
            const data = await api('/api/Cart', {}, i18n.language);
            setCart(data);
        } catch (err) {
            setError(err.message);
        }
    }, [i18n.language]);

    const loadOrders = useCallback(async (id) => {
        setOrdersLoading(true);
        setError(null);
        try {
            const data = await api(`/api/Orders?customerId=${id}`, {}, i18n.language);
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setOrdersLoading(false);
        }
    }, [i18n.language]);

    useEffect(() => {
        setLoading(true);
        Promise.all([loadProducts(), loadCart()]).finally(() => setLoading(false));
    }, [loadProducts, loadCart]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data) {
                    setCustomer(data);
                    setCustomerId(data.id);
                }
            })
            .catch(() => setCustomer(null));

        fetch(`${API_BASE_URL}/api/auth/github/me`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setGithubUser(data))
            .catch(() => setGithubUser(null));

        const params = new URLSearchParams(window.location.search);
        if (params.has('githubLogin') || params.has('githubError')) {
            params.delete('githubLogin');
            params.delete('githubError');
            const query = params.toString();
            window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''));
        }
    }, []);

    const githubLogout = async () => {
        await fetch(`${API_BASE_URL}/api/auth/github/logout`, { method: 'POST', credentials: 'include' });
        setGithubUser(null);
    };

    useEffect(() => {
        if (activeTab === 'orders') loadOrders(customerId);
    }, [activeTab, customerId, loadOrders]);

    const addToCart = async (productId) => {
        setError(null);
        try {
            const data = await api('/api/Cart', {
                method: 'POST',
                body: JSON.stringify({ productId, quantity: 1 }),
            }, i18n.language);
            setCart(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const removeFromCart = async (productId) => {
        setError(null);
        try {
            const data = await api(`/api/Cart/${productId}`, { method: 'DELETE' }, i18n.language);
            setCart(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const checkout = async () => {
        setError(null);
        try {
            const created = await api(`/api/Cart/checkout?customerId=${customerId}`, { method: 'POST' }, i18n.language);
            setOrder(created);
            setCart([]);
            if (activeTab === 'orders') loadOrders(customerId);
        } catch (err) {
            setError(err.message);
        }
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="app">
            <header className="header">
                <div className="header-inner">
                    <span className="brand">
                        <span className="brand-title">{t('brand.title')}</span>
                    </span>
                    <nav className="nav">
                        <button
                            className={`nav-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                            onClick={() => setActiveTab('catalog')}
                        >
                            {t('nav.catalog')}
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            {t('nav.orders')}
                        </button>
                    </nav>
                    <div className="header-actions">
                        <LanguageSwitcher />
                        <GoogleLoginButton
                            customer={customer}
                            apiBaseUrl={API_BASE_URL}
                            onLogin={(c) => { setCustomer(c); setCustomerId(c.id); }}
                            onLogout={() => setCustomer(null)}
                        />
                        {githubUser ? (
                            <div className="github-user">
                                {githubUser.avatarUrl && <img src={githubUser.avatarUrl} alt={githubUser.login} className="github-avatar" />}
                                <span>{githubUser.name || githubUser.login}</span>
                                <button className="btn btn-ghost" onClick={githubLogout}>{t('github.logout')}</button>
                            </div>
                        ) : (
                            <a className="btn btn-github" href={`${API_BASE_URL}/api/auth/github/login`}>
                                {t('github.login')}
                            </a>
                        )}
                        <div className="cart-badge">{t('cart.title')} · {cart.length}</div>
                    </div>
                </div>
            </header>

            {activeTab === 'catalog' && (
                <div className="hero">
                    <div className="hero-inner">
                        <span className="hero-eyebrow">{t('hero.eyebrow')}</span>
                        <h1 className="hero-title">{t('brand.subtitle')}</h1>
                        <p className="hero-subtitle">{t('hero.subtitle')}</p>
                    </div>
                </div>
            )}

            <main className="main">
                {error && <div className="alert">{t('common.requestError', { status: error })}</div>}
                {order && (
                    <div className="order-success">
                        {t('orderSuccess', { id: order.id, price: order.totalPrice })}
                        <button className="btn btn-ghost" onClick={() => setOrder(null)}>{t('common.ok')}</button>
                    </div>
                )}

                {activeTab === 'orders' ? (
                    <section className="panel orders-panel">
                        <div className="panel-head">
                            <h2>{t('orders.title')}</h2>
                            <div className="field field-inline">
                                <label>{t('cart.customerId')}</label>
                                <input
                                    type="number"
                                    value={customerId}
                                    onChange={(e) => setCustomerId(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {ordersLoading ? (
                            <div className="loader">
                                <div className="spinner"></div>
                                <span>{t('common.loading')}</span>
                            </div>
                        ) : orders.length === 0 ? (
                            <p className="empty">{t('orders.empty')}</p>
                        ) : (
                            <ul className="orders-list">
                                {orders.map((o) => (
                                    <li key={o.id} className="order-card">
                                        <div className="order-card-head">
                                            <span>{t('orders.order')} #{o.id}</span>
                                            <span className="badge">{o.status}</span>
                                        </div>
                                        <div className="order-card-date">
                                            {new Date(o.createdAt).toLocaleString(i18n.language)}
                                        </div>
                                        <ul className="order-items">
                                            {o.items.map((item) => (
                                                <li key={item.productId}>
                                                    {item.productName} × {item.quantity} — {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'UAH' }).format(item.unitPrice * item.quantity)}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="order-card-total">{t('orders.total')}: {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'UAH' }).format(o.totalPrice)}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ) : (
                <div className="layout">
                    <section className="panel catalog-panel">
                        <div className="panel-head">
                            <h2>{t('catalog.title')}</h2>
                            <span className="count">{t('catalog.count', { count: products.length })}</span>
                        </div>

                        {loading ? (
                            <div className="loader">
                                <div className="spinner"></div>
                                <span>{t('common.loading')}</span>
                            </div>
                        ) : (
                            <div className="grid">
                                {products.map((p) => (
                                    <div key={p.id} className="card">
                                        <div className="card-thumb">
                                            {p.imageUrl && !brokenImages[p.id] ? (
                                                <img
                                                    src={p.imageUrl}
                                                    alt={p.name}
                                                    loading="lazy"
                                                    onError={() => setBrokenImages((prev) => ({ ...prev, [p.id]: true }))}
                                                />
                                            ) : (
                                                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M6 40c0-3 2-5 5-6l9-3 12-9c2-2 5-2 7-1l14 7c3 1 5 4 5 7v4c0 2-2 4-4 4H10c-2 0-4-2-4-4v-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                                                    <path d="M20 22v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <h3>{p.name}</h3>
                                            <p className="brand-name">{p.brand}</p>
                                            <p className="meta">{t('catalog.size')} {p.size} · {p.color}</p>
                                            <p className="desc">{p.description}</p>
                                            <div className="card-footer">
                                                <span className="price">{new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'UAH' }).format(p.price)}</span>
                                                <button className="btn btn-primary" onClick={() => addToCart(p.id)}>
                                                    {t('catalog.addToCart')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="panel cart-panel">
                        <div className="panel-head">
                            <h2>{t('cart.title')}</h2>
                        </div>

                        {cart.length === 0 ? (
                            <p className="empty">{t('cart.empty')}</p>
                        ) : (
                            <>
                                <ul className="cart-list">
                                    {cart.map((item) => (
                                        <li key={item.productId} className="cart-item">
                                            <span>{item.productName} × {item.quantity}</span>
                                            <span>{new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'UAH' }).format(item.price * item.quantity)}</span>
                                            <button className="icon-btn delete" onClick={() => removeFromCart(item.productId)}>✕</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="cart-total">{t('cart.total')}: {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'UAH' }).format(total)}</div>
                                <div className="field">
                                    <label>{t('cart.customerId')}</label>
                                    <input
                                        type="number"
                                        value={customerId}
                                        onChange={(e) => setCustomerId(Number(e.target.value))}
                                    />
                                </div>
                                <button className="btn btn-primary btn-block" onClick={checkout}>
                                    {t('cart.checkout')}
                                </button>
                            </>
                        )}
                    </section>
                </div>
                )}
            </main>

            <footer className="footer">
                <div className="footer-inner">
                    <span>{t('footer')}</span>
                </div>
            </footer>
        </div>
    );
}
