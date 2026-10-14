import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMoney } from '../components/useMoney.js';
import { useShop } from '../context/ShopContext.jsx';

// /order: підсумок і підтвердження замовлення. Покупець береться із сесії на сервері;
// гість може оформити замовлення без акаунта (на службового покупця «Гість»).
export default function OrderPage() {
    const { t } = useTranslation();
    const money = useMoney();
    const { customer, cart, cartTotal, checkout, notify, errorText } = useShop();
    const [placing, setPlacing] = useState(false);
    const [done, setDone] = useState(null);

    const place = async () => {
        setPlacing(true);
        try {
            const order = await checkout();
            setDone(order);
        } catch (err) {
            notify(errorText(err), 'error');
        } finally {
            setPlacing(false);
        }
    };

    if (done) {
        return (
            <main className="main narrow">
                <div className="success-box">
                    <div className="success-icon" aria-hidden="true">✓</div>
                    <h2>{t('order.doneTitle')}</h2>
                    <p>{t('order.doneText', { id: done.id, price: money(done.totalPrice) })}</p>
                    <div className="row-actions">
                        {customer && <Link className="btn btn-primary" to="/orders">{t('order.viewOrders')}</Link>}
                        <Link className="btn btn-ghost" to="/">{t('order.toShop')}</Link>
                    </div>
                </div>
            </main>
        );
    }

    if (cart.length === 0) {
        return (
            <main className="main narrow">
                <p className="empty">{t('order.emptyCart')}</p>
                <p className="center"><Link className="btn btn-primary" to="/">{t('order.toShop')}</Link></p>
            </main>
        );
    }

    return (
        <main className="main narrow">
            <div className="panel-head"><h2>{t('order.title')}</h2></div>

            <section className="box">
                <h3>{t('order.contact')}</h3>
                {customer ? (
                    <p className="box-text"><strong>{customer.fullName}</strong><br />{customer.email}{customer.phone ? <><br />{customer.phone}</> : null}</p>
                ) : (
                    <p className="box-text">
                        {t('order.guest')}{' '}
                        <Link className="inline-link" to="/login" state={{ from: '/order' }}>{t('order.loginPrompt')}</Link>
                    </p>
                )}
            </section>

            <section className="box">
                <h3>{t('order.items')}</h3>
                <ul className="order-lines">
                    {cart.map((i) => (
                        <li key={`${i.productId}-${i.size}`}>
                            <span>{i.productName}{i.size ? ` (${i.size})` : ''} × {i.quantity}</span>
                            <span>{money(i.price * i.quantity)}</span>
                        </li>
                    ))}
                </ul>
                <div className="summary-row total"><span>{t('cart.total')}</span><strong>{money(cartTotal)}</strong></div>
            </section>

            <button className="btn btn-primary btn-block btn-large" onClick={place} disabled={placing}>
                {placing ? t('order.placing') : t('order.place')}
            </button>
            <p className="center"><Link className="link-btn" to="/cart">{t('cart.title')}</Link></p>
        </main>
    );
}
