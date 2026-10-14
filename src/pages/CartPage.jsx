import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductImage from '../components/ProductImage.jsx';
import { ConfirmModal } from '../components/Modal.jsx';
import { useMoney } from '../components/useMoney.js';
import { useShop } from '../context/ShopContext.jsx';

export default function CartPage() {
    const { t } = useTranslation();
    const money = useMoney();
    const navigate = useNavigate();
    const { cart, cartTotal, setQuantity, removeFromCart, clearCart, notify, errorText } = useShop();
    const [confirmClear, setConfirmClear] = useState(false);
    const [busy, setBusy] = useState(false);

    const run = async (action) => {
        setBusy(true);
        try {
            await action();
        } catch (err) {
            notify(errorText(err), 'error');
        } finally {
            setBusy(false);
        }
    };

    const doClear = async () => {
        setConfirmClear(false);
        await run(async () => {
            await clearCart();
            notify(t('cart.cleared'), 'info');
        });
    };

    return (
        <main className="main">
            <div className="panel-head">
                <h2>{t('cart.title')}</h2>
                {cart.length > 0 && <button className="link-btn" onClick={() => setConfirmClear(true)} disabled={busy}>{t('cart.clear')}</button>}
            </div>

            {cart.length === 0 ? (
                <>
                    <p className="empty">{t('cart.empty')}</p>
                    <p className="center"><Link className="btn btn-primary" to="/">{t('cart.continue')}</Link></p>
                </>
            ) : (
                <div className="cart-layout">
                    <ul className="cart-lines">
                        {cart.map((item) => (
                            <li key={item.productId} className="cart-line">
                                <Link to={`/product/${item.productId}`} className="cart-line-img">
                                    <ProductImage product={{ imageUrl: item.imageUrl, name: item.productName, color: '', categoryId: 1 }} />
                                </Link>
                                <div className="cart-line-info">
                                    <Link to={`/product/${item.productId}`} className="cart-line-name">{item.productName}</Link>
                                    <span className="cart-line-price">{money(item.price)}</span>
                                    <div className="qty" aria-label={t('cart.qty')}>
                                        <button disabled={busy || item.quantity <= 1} onClick={() => run(() => setQuantity(item.productId, item.quantity - 1))} aria-label="-">−</button>
                                        <span>{item.quantity}</span>
                                        <button disabled={busy} onClick={() => run(() => setQuantity(item.productId, item.quantity + 1))} aria-label="+">+</button>
                                    </div>
                                </div>
                                <div className="cart-line-end">
                                    <strong>{money(item.price * item.quantity)}</strong>
                                    <button className="link-btn" disabled={busy} onClick={() => run(() => removeFromCart(item.productId))}>{t('cart.remove')}</button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <aside className="summary">
                        <div className="summary-row"><span>{t('cart.total')}</span><strong>{money(cartTotal)}</strong></div>
                        <button className="btn btn-primary btn-block" onClick={() => navigate('/order')}>{t('cart.checkout')}</button>
                        <Link className="btn btn-ghost btn-block" to="/">{t('cart.continue')}</Link>
                    </aside>
                </div>
            )}

            {confirmClear && (
                <ConfirmModal
                    title={t('cart.clearTitle')}
                    text={t('cart.clearText')}
                    confirmLabel={t('cart.clear')}
                    onConfirm={doClear}
                    onCancel={() => setConfirmClear(false)}
                />
            )}
        </main>
    );
}
