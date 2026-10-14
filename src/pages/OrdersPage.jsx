import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useMoney } from '../components/useMoney.js';
import { useShop } from '../context/ShopContext.jsx';

// Сервер повертає статус як число (enum) або рядок; приводимо до ключа перекладу.
const STATUS_KEYS = ['New', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
export const statusKey = (s) => (typeof s === 'number' ? STATUS_KEYS[s] : s) ?? 'New';

export default function OrdersPage() {
    const { t, i18n } = useTranslation();
    const money = useMoney();
    const { customer, authReady, notify, errorText } = useShop();
    const [orders, setOrders] = useState(null);

    useEffect(() => {
        if (!customer) return;
        api('/api/Orders', { lang: i18n.language })
            .then((list) => setOrders([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
            .catch((err) => { notify(errorText(err), 'error'); setOrders([]); });
    }, [customer, i18n.language, notify, errorText]);

    if (!authReady) return <main className="main"><div className="loader"><div className="spinner" /></div></main>;

    if (!customer) {
        return (
            <main className="main narrow">
                <div className="panel-head"><h2>{t('orders.title')}</h2></div>
                <p className="empty">{t('orders.loginRequired')}</p>
                <p className="center"><Link className="btn btn-primary" to="/login" state={{ from: '/orders' }}>{t('nav.login')}</Link></p>
            </main>
        );
    }

    return (
        <main className="main narrow">
            <div className="panel-head"><h2>{t('orders.title')}</h2></div>
            {orders === null ? (
                <div className="loader"><div className="spinner" /><span>{t('common.loading')}</span></div>
            ) : orders.length === 0 ? (
                <>
                    <p className="empty">{t('orders.empty')}</p>
                    <p className="center"><Link className="btn btn-primary" to="/">{t('hero.cta')}</Link></p>
                </>
            ) : (
                <ul className="orders-list">
                    {orders.map((o) => (
                        <li key={o.id} className="order-card">
                            <div className="order-card-head">
                                <span>{t('orders.order')} #{o.id}</span>
                                <span className={`badge status-${statusKey(o.status)}`}>{t(`orders.status.${statusKey(o.status)}`)}</span>
                            </div>
                            <div className="order-card-date">{new Date(o.createdAt).toLocaleString(i18n.language)}</div>
                            <ul className="order-items">
                                {o.items.map((item) => (
                                    <li key={item.productId}>
                                        <Link to={`/product/${item.productId}`}>{item.productName}</Link> × {item.quantity} — {money(item.unitPrice * item.quantity)}
                                    </li>
                                ))}
                            </ul>
                            <div className="order-card-total">{t('orders.total')}: {money(o.totalPrice)}</div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
