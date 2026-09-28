import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
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
                    <div className="brand">
                        <span className="brand-icon">👟</span>
                        <div className="brand-text">
                            <span className="brand-title">{t('brand.title')}</span>
                            <span className="brand-sub">{t('brand.subtitle')}</span>
                        </div>
                    </div>
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
                    <LanguageSwitcher />
                    <div className="cart-badge">🛒 {cart.length}</div>
                </div>
            </header>

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
