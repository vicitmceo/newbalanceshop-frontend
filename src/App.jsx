import { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://newbalanceshop-api.onrender.com';

async function api(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!response.ok) throw new Error(`Помилка запиту: ${response.status}`);
    if (response.status === 204) return null;
    return response.json();
}

export default function App() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [customerId, setCustomerId] = useState(1);

    const loadProducts = useCallback(async () => {
        try {
            const data = await api('/api/Products');
            setProducts(data);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const loadCart = useCallback(async () => {
        try {
            const data = await api('/api/Cart');
            setCart(data);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        Promise.all([loadProducts(), loadCart()]).finally(() => setLoading(false));
    }, [loadProducts, loadCart]);

    const addToCart = async (productId) => {
        setError(null);
        try {
            const data = await api('/api/Cart', {
                method: 'POST',
                body: JSON.stringify({ productId, quantity: 1 }),
            });
            setCart(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const removeFromCart = async (productId) => {
        setError(null);
        try {
            const data = await api(`/api/Cart/${productId}`, { method: 'DELETE' });
            setCart(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const checkout = async () => {
        setError(null);
        try {
            const created = await api(`/api/Cart/checkout?customerId=${customerId}`, { method: 'POST' });
            setOrder(created);
            setCart([]);
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
                            <span className="brand-title">New Balance Shop</span>
                            <span className="brand-sub">Інтернет-магазин спортивного одягу та взуття</span>
                        </div>
                    </div>
                    <div className="cart-badge">🛒 {cart.length}</div>
                </div>
            </header>

            <main className="main">
                {error && <div className="alert">{error}</div>}
                {order && (
                    <div className="order-success">
                        Замовлення #{order.id} оформлено! Сума: {order.totalPrice} ₴
                        <button className="btn btn-ghost" onClick={() => setOrder(null)}>OK</button>
                    </div>
                )}

                <div className="layout">
                    <section className="panel catalog-panel">
                        <div className="panel-head">
                            <h2>Каталог товарів</h2>
                            <span className="count">{products.length} товарів</span>
                        </div>

                        {loading ? (
                            <div className="loader">
                                <div className="spinner"></div>
                                <span>Завантаження...</span>
                            </div>
                        ) : (
                            <div className="grid">
                                {products.map((p) => (
                                    <div key={p.id} className="card">
                                        <div className="card-body">
                                            <h3>{p.name}</h3>
                                            <p className="brand-name">{p.brand}</p>
                                            <p className="meta">Розмір {p.size} · {p.color}</p>
                                            <p className="desc">{p.description}</p>
                                            <div className="card-footer">
                                                <span className="price">{p.price} ₴</span>
                                                <button className="btn btn-primary" onClick={() => addToCart(p.id)}>
                                                    В кошик
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
                            <h2>Кошик</h2>
                        </div>

                        {cart.length === 0 ? (
                            <p className="empty">Кошик порожній</p>
                        ) : (
                            <>
                                <ul className="cart-list">
                                    {cart.map((item) => (
                                        <li key={item.productId} className="cart-item">
                                            <span>{item.productName} × {item.quantity}</span>
                                            <span>{item.price * item.quantity} ₴</span>
                                            <button className="icon-btn delete" onClick={() => removeFromCart(item.productId)}>✕</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="cart-total">Разом: {total} ₴</div>
                                <div className="field">
                                    <label>ID покупця</label>
                                    <input
                                        type="number"
                                        value={customerId}
                                        onChange={(e) => setCustomerId(Number(e.target.value))}
                                    />
                                </div>
                                <button className="btn btn-primary btn-block" onClick={checkout}>
                                    Оформити замовлення
                                </button>
                            </>
                        )}
                    </section>
                </div>
            </main>

            <footer className="footer">
                <div className="footer-inner">
                    <span>© New Balance Shop — курсовий проєкт, Team 1</span>
                </div>
            </footer>
        </div>
    );
}
