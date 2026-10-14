import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import Modal, { ConfirmModal } from '../components/Modal.jsx';
import { useMoney } from '../components/useMoney.js';
import { useShop } from '../context/ShopContext.jsx';
import { statusKey } from './OrdersPage.jsx';

// службовий покупець «Гість» (id=1): на нього оформлюються замовлення без входу, видаляти чи блокувати його не можна
const GUEST_ID = 1;
const STATUSES = ['New', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

function Loading() {
    const { t } = useTranslation();
    return <div className="loader"><div className="spinner" /><span>{t('common.loading')}</span></div>;
}

// ---------- Користувачі ----------
function UsersTab() {
    const { t } = useTranslation();
    const { customer, notify, errorText } = useShop();
    const [users, setUsers] = useState(null);
    const [toDelete, setToDelete] = useState(null);

    const load = useCallback(() => api('/api/Customers').then(setUsers).catch((e) => { notify(errorText(e), 'error'); setUsers([]); }), [notify, errorText]);
    useEffect(() => { load(); }, [load]);

    const setBlocked = async (u, blocked) => {
        try {
            const updated = await api(`/api/Customers/${u.id}/block`, { method: 'PATCH', body: { blocked } });
            setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
            notify(blocked ? t('admin.userBlocked') : t('admin.userUnblocked'), 'success');
        } catch (e) { notify(errorText(e), 'error'); }
    };

    const remove = async () => {
        const u = toDelete;
        setToDelete(null);
        try {
            await api(`/api/Customers/${u.id}`, { method: 'DELETE' });
            setUsers((list) => list.filter((x) => x.id !== u.id));
            notify(t('admin.userDeleted'), 'success');
        } catch (e) { notify(errorText(e), 'error'); }
    };

    if (!users) return <Loading />;

    return (
        <>
            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>{t('admin.id')}</th><th>{t('admin.name')}</th><th>{t('admin.email')}</th>
                            <th>{t('admin.role')}</th><th>{t('admin.status')}</th><th>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const self = u.id === customer.id;
                            return (
                                <tr key={u.id} className={u.isBlocked ? 'row-muted' : ''}>
                                    <td data-label={t('admin.id')}>{u.id}</td>
                                    <td data-label={t('admin.name')}>{u.fullName}{self && <em className="you"> ({t('admin.self')})</em>}</td>
                                    <td data-label={t('admin.email')}>{u.email}</td>
                                    <td data-label={t('admin.role')}>{u.isAdmin ? <span className="role-badge admin">{t('account.roleAdmin')}</span> : t('account.roleCustomer')}</td>
                                    <td data-label={t('admin.status')}><span className={`pill ${u.isBlocked ? 'pill-bad' : 'pill-ok'}`}>{u.isBlocked ? t('admin.blockedState') : t('admin.active')}</span></td>
                                    <td data-label={t('admin.actions')} className="actions">
                                        {!self && !u.isAdmin && u.id !== GUEST_ID && (
                                            <>
                                                <button className="btn btn-ghost btn-small" onClick={() => setBlocked(u, !u.isBlocked)}>{u.isBlocked ? t('admin.unblock') : t('admin.block')}</button>
                                                <button className="btn btn-danger btn-small" onClick={() => setToDelete(u)}>{t('admin.delete')}</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {toDelete && (
                <ConfirmModal
                    title={t('admin.deleteUserTitle')}
                    text={t('admin.deleteUserText', { name: toDelete.fullName })}
                    confirmLabel={t('admin.delete')}
                    onConfirm={remove}
                    onCancel={() => setToDelete(null)}
                />
            )}
        </>
    );
}

// ---------- Товари ----------
const EMPTY_PRODUCT = { name: '', brand: 'New Balance', categoryId: 1, size: '', color: '', price: '', stock: '', imageUrl: '', description: '' };

function ProductForm({ initial, onClose, onSaved }) {
    const { t } = useTranslation();
    const { notify, errorText } = useShop();
    const [form, setForm] = useState({ ...EMPTY_PRODUCT, ...initial });
    const [busy, setBusy] = useState(false);
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
    const editing = Boolean(initial?.id);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        const body = { ...form, categoryId: Number(form.categoryId), price: Number(form.price), stock: Number(form.stock) };
        try {
            if (editing) await api(`/api/Products/${initial.id}`, { method: 'PUT', body });
            else await api('/api/Products', { method: 'POST', body });
            notify(t('admin.productSaved'), 'success');
            onSaved();
        } catch (err) {
            notify(errorText(err), 'error');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal title={editing ? t('admin.editProduct') : t('admin.newProduct')} onClose={onClose} wide>
            <form className="form" onSubmit={submit}>
                <label className="f"><span>{t('admin.name')}</span><input className="input" required maxLength={150} value={form.name} onChange={set('name')} /></label>
                <div className="f-row">
                    <label className="f"><span>{t('admin.brand')}</span><input className="input" required value={form.brand} onChange={set('brand')} /></label>
                    <label className="f">
                        <span>{t('admin.category')}</span>
                        <select className="input" value={form.categoryId} onChange={set('categoryId')}>
                            {[1, 2, 3].map((id) => <option key={id} value={id}>{t(`categories.${id}`)}</option>)}
                        </select>
                    </label>
                </div>
                <div className="f-row">
                    <label className="f"><span>{t('admin.size')}</span><input className="input" value={form.size} onChange={set('size')} /></label>
                    <label className="f"><span>{t('admin.color')}</span><input className="input" value={form.color} onChange={set('color')} /></label>
                </div>
                <div className="f-row">
                    <label className="f"><span>{t('admin.price')}</span><input className="input" type="number" min="0" step="1" required value={form.price} onChange={set('price')} /></label>
                    <label className="f"><span>{t('admin.stock')}</span><input className="input" type="number" min="0" step="1" required value={form.stock} onChange={set('stock')} /></label>
                </div>
                <label className="f"><span>{t('admin.image')}</span><input className="input" maxLength={300} value={form.imageUrl} onChange={set('imageUrl')} /></label>
                <label className="f"><span>{t('admin.description')}</span><textarea className="input" rows={3} maxLength={1000} value={form.description} onChange={set('description')} /></label>
                <div className="row-actions">
                    <button className="btn btn-ghost" type="button" onClick={onClose}>{t('common.cancel')}</button>
                    <button className="btn btn-primary" type="submit" disabled={busy}>{t('common.save')}</button>
                </div>
            </form>
        </Modal>
    );
}

function ProductsTab() {
    const { t } = useTranslation();
    const money = useMoney();
    const { notify, errorText } = useShop();
    const [products, setProducts] = useState(null);
    const [editing, setEditing] = useState(null);
    const [toDelete, setToDelete] = useState(null);

    const load = useCallback(() => api('/api/Products').then(setProducts).catch((e) => { notify(errorText(e), 'error'); setProducts([]); }), [notify, errorText]);
    useEffect(() => { load(); }, [load]);

    const remove = async () => {
        const p = toDelete;
        setToDelete(null);
        try {
            await api(`/api/Products/${p.id}`, { method: 'DELETE' });
            notify(t('admin.productDeleted'), 'success');
            load();
        } catch (e) { notify(errorText(e), 'error'); }
    };

    if (!products) return <Loading />;

    return (
        <>
            <div className="toolbar"><button className="btn btn-primary" onClick={() => setEditing({})}>+ {t('admin.addProduct')}</button></div>
            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>{t('admin.id')}</th><th>{t('admin.name')}</th><th>{t('admin.category')}</th>
                            <th>{t('admin.price')}</th><th>{t('admin.stock')}</th><th>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id}>
                                <td data-label={t('admin.id')}>{p.id}</td>
                                <td data-label={t('admin.name')}>{p.name}</td>
                                <td data-label={t('admin.category')}>{t(`categories.${p.categoryId}`)}</td>
                                <td data-label={t('admin.price')}>{money(p.price)}</td>
                                <td data-label={t('admin.stock')}>{p.stock}</td>
                                <td data-label={t('admin.actions')} className="actions">
                                    <button className="btn btn-ghost btn-small" onClick={() => setEditing(p)}>{t('common.edit')}</button>
                                    <button className="btn btn-danger btn-small" onClick={() => setToDelete(p)}>{t('admin.delete')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
            {toDelete && (
                <ConfirmModal
                    title={t('admin.deleteProductTitle')}
                    text={t('admin.deleteProductText', { name: toDelete.name })}
                    confirmLabel={t('admin.delete')}
                    onConfirm={remove}
                    onCancel={() => setToDelete(null)}
                />
            )}
        </>
    );
}

// ---------- Замовлення ----------
function OrdersTab() {
    const { t, i18n } = useTranslation();
    const money = useMoney();
    const { notify, errorText } = useShop();
    const [orders, setOrders] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api('/api/Orders/all').then(setOrders).catch((e) => { notify(errorText(e), 'error'); setOrders([]); });
        api('/api/Customers').then(setUsers).catch(() => {});
    }, [notify, errorText]);

    const nameOf = (id) => users.find((u) => u.id === id)?.fullName ?? `#${id}`;

    const changeStatus = async (order, key) => {
        try {
            await api(`/api/Orders/${order.id}/status`, { method: 'PATCH', body: { status: STATUSES.indexOf(key) } });
            setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: STATUSES.indexOf(key) } : o)));
            notify(t('admin.statusUpdated'), 'success');
        } catch (e) { notify(errorText(e), 'error'); }
    };

    if (!orders) return <Loading />;
    if (orders.length === 0) return <p className="empty">{t('admin.noOrders')}</p>;

    return (
        <div className="table-wrap">
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th><th>{t('admin.customer')}</th><th>{t('admin.date')}</th>
                        <th>{t('orders.title')}</th><th>{t('admin.total')}</th><th>{t('admin.status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((o) => (
                        <tr key={o.id}>
                            <td data-label="#">{o.id}</td>
                            <td data-label={t('admin.customer')}>{nameOf(o.customerId)}</td>
                            <td data-label={t('admin.date')}>{new Date(o.createdAt).toLocaleString(i18n.language)}</td>
                            <td data-label={t('orders.title')}>{o.items.map((i) => `${i.productName} × ${i.quantity}`).join(', ')}</td>
                            <td data-label={t('admin.total')}>{money(o.totalPrice)}</td>
                            <td data-label={t('admin.status')}>
                                <select className="input input-small" value={statusKey(o.status)} onChange={(e) => changeStatus(o, e.target.value)}>
                                    {STATUSES.map((s) => <option key={s} value={s}>{t(`orders.status.${s}`)}</option>)}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function AdminPage() {
    const { t } = useTranslation();
    const { customer, authReady } = useShop();
    const [tab, setTab] = useState('users');

    if (!authReady) return <main className="main"><Loading /></main>;

    if (!customer) {
        return (
            <main className="main narrow">
                <p className="empty">{t('errors.e401')}</p>
                <p className="center"><Link className="btn btn-primary" to="/login" state={{ from: '/admin' }}>{t('nav.login')}</Link></p>
            </main>
        );
    }
    if (!customer.isAdmin) {
        return (
            <main className="main narrow">
                <p className="empty">{t('admin.forbidden')}</p>
                <p className="center"><Link className="btn btn-primary" to="/">{t('product.back')}</Link></p>
            </main>
        );
    }

    const tabs = [['users', t('admin.tabUsers')], ['products', t('admin.tabProducts')], ['orders', t('admin.tabOrders')]];

    return (
        <main className="main">
            <div className="panel-head"><h2>{t('admin.title')}</h2></div>
            <div className="chips" role="tablist">
                {tabs.map(([key, label]) => (
                    <button key={key} role="tab" aria-selected={tab === key} className={`chip ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
                ))}
            </div>
            {tab === 'users' && <UsersTab />}
            {tab === 'products' && <ProductsTab />}
            {tab === 'orders' && <OrdersTab />}
        </main>
    );
}
