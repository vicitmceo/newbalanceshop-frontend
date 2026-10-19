import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import CountrySelect from '../components/CountrySelect.jsx';
import { useShop } from '../context/ShopContext.jsx';

export default function AccountPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { customer, setCustomer, authReady, logout, notify, errorText } = useShop();
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', city: '', country: '' });
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (customer) {
            setForm({
                fullName: customer.fullName ?? '', email: customer.email ?? '', phone: customer.phone ?? '',
                city: customer.city ?? '', country: customer.country ?? '',
            });
        }
    }, [customer]);

    if (!authReady) return <main className="main"><div className="loader"><div className="spinner" /></div></main>;

    if (!customer) {
        return (
            <main className="main narrow">
                <p className="empty">{t('account.loginRequired')}</p>
                <p className="center"><Link className="btn btn-primary" to="/login" state={{ from: '/account' }}>{t('nav.login')}</Link></p>
            </main>
        );
    }

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const updated = await api(`/api/Customers/${customer.id}`, { method: 'PUT', body: form });
            setCustomer(updated);
            notify(t('account.saved'), 'success');
        } catch (err) {
            notify(errorText(err), 'error');
        } finally {
            setBusy(false);
        }
    };

    const out = async () => {
        await logout();
        notify(t('auth.loggedOut'), 'info');
        navigate('/');
    };

    return (
        <main className="main narrow">
            <div className="panel-head">
                <h2>{t('account.title')}</h2>
                <span className={`role-badge ${customer.isAdmin ? 'admin' : ''}`}>
                    {customer.isAdmin ? t('account.roleAdmin') : t('account.roleCustomer')}
                </span>
            </div>

            <form className="box form" onSubmit={save}>
                <h3>{t('account.profile')}</h3>
                <label className="f"><span>{t('auth.fullName')}</span><input className="input" required value={form.fullName} onChange={set('fullName')} /></label>
                <label className="f"><span>{t('auth.email')}</span><input className="input" type="email" required value={form.email} onChange={set('email')} /></label>
                <div className="f-row">
                    <label className="f"><span>{t('auth.phone')}</span><input className="input" type="tel" value={form.phone} onChange={set('phone')} /></label>
                    <label className="f"><span>{t('auth.city')}</span><input className="input" value={form.city} onChange={set('city')} /></label>
                    <label className="f"><span>{t('auth.country')}</span><CountrySelect autoComplete="country-name" value={form.country} onChange={set('country')} /></label>
                </div>
                <div className="row-actions">
                    <button className="btn btn-primary" type="submit" disabled={busy}>{t('account.save')}</button>
                    <Link className="btn btn-ghost" to="/orders">{t('nav.orders')}</Link>
                    {customer.isAdmin && <Link className="btn btn-ghost" to="/admin">{t('nav.admin')}</Link>}
                    <button className="btn btn-ghost push-right" type="button" onClick={out}>{t('auth.logout')}</button>
                </div>
            </form>
        </main>
    );
}
