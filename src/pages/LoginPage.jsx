import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CountrySelect from '../components/CountrySelect.jsx';
import SocialLogin from '../components/SocialLogin.jsx';
import { ApiError } from '../api.js';
import { useShop } from '../context/ShopContext.jsx';

// /login і /register: одна сторінка з перемикачем «Вхід / Реєстрація» та входом через Google і GitHub.
export default function LoginPage({ initialMode = 'login' }) {
    const { t } = useTranslation();
    const { customer, authReady, login, register, notify, errorText } = useShop();
    const navigate = useNavigate();
    const location = useLocation();
    const [search] = useSearchParams();
    const [mode, setMode] = useState(initialMode);
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', city: '', country: '' });
    const [error, setError] = useState('');

    const target = location.state?.from || search.get('next') || '/';
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    useEffect(() => { setMode(initialMode); setError(''); }, [initialMode]);

    if (authReady && customer) return <Navigate to={target} replace />;

    const switchMode = (next) => {
        setMode(next);
        setError('');
        navigate(next === 'login' ? '/login' : '/register', { replace: true, state: location.state });
    };

    const humanError = (err) => {
        if (err instanceof ApiError) {
            if (err.status === 401) return err.message && err.message.toLowerCase().includes('заблок') ? t('auth.blocked') : t('auth.invalidCredentials');
            if (err.status === 400 && /вже зареєстрований/i.test(err.message)) return t('auth.emailTaken');
        }
        return errorText(err);
    };

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (mode === 'register' && form.password.length < 8) {
            setError(t('auth.passwordHint'));
            return;
        }
        setBusy(true);
        try {
            const me = mode === 'login'
                ? await login(form.email.trim(), form.password)
                : await register({ ...form, email: form.email.trim(), fullName: form.fullName.trim() });
            notify(t('auth.welcome', { name: me.fullName }), 'success');
            navigate(target, { replace: true });
        } catch (err) {
            setError(humanError(err));
        } finally {
            setBusy(false);
        }
    };

    const isLogin = mode === 'login';

    return (
        <main className="main auth-page">
            <div className="auth-card">
                <div className="seg" role="tablist">
                    <button role="tab" aria-selected={isLogin} className={isLogin ? 'active' : ''} onClick={() => switchMode('login')}>{t('auth.loginTab')}</button>
                    <button role="tab" aria-selected={!isLogin} className={!isLogin ? 'active' : ''} onClick={() => switchMode('register')}>{t('auth.registerTab')}</button>
                </div>

                <h1 className="auth-title">{isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}</h1>

                <SocialLogin onDone={() => navigate(target, { replace: true })} />

                <div className="or"><span>{t('auth.or')}</span></div>

                <form onSubmit={submit} className="form" noValidate={false}>
                    {!isLogin && (
                        <label className="f">
                            <span>{t('auth.fullName')}</span>
                            <input className="input" required autoComplete="name" value={form.fullName} onChange={set('fullName')} />
                        </label>
                    )}
                    <label className="f">
                        <span>{t('auth.email')}</span>
                        <input className="input" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
                    </label>
                    <label className="f">
                        <span>{t('auth.password')}</span>
                        <input
                            className="input" type="password" required minLength={isLogin ? undefined : 8}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                            value={form.password} onChange={set('password')}
                        />
                        {!isLogin && <small>{t('auth.passwordHint')}</small>}
                    </label>
                    {!isLogin && (
                        <div className="f-row">
                            <label className="f">
                                <span>{t('auth.phone')}</span>
                                <input className="input" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} />
                            </label>
                            <label className="f">
                                <span>{t('auth.city')}</span>
                                <input className="input" autoComplete="address-level2" value={form.city} onChange={set('city')} />
                            </label>
                            <label className="f">
                                <span>{t('auth.country')}</span>
                                <CountrySelect autoComplete="country-name" value={form.country} onChange={set('country')} />
                            </label>
                        </div>
                    )}

                    {error && <div className="alert" role="alert">{error}</div>}

                    <button className="btn btn-primary btn-block btn-large" type="submit" disabled={busy}>
                        {busy ? t('common.loading') : isLogin ? t('auth.submitLogin') : t('auth.submitRegister')}
                    </button>
                </form>

                <p className="auth-switch">
                    {isLogin ? (
                        <button className="link-btn" onClick={() => switchMode('register')}>{t('auth.registerTab')} →</button>
                    ) : (
                        <button className="link-btn" onClick={() => switchMode('login')}>← {t('auth.loginTab')}</button>
                    )}
                </p>
                <p className="center"><Link className="link-btn" to="/">{t('product.back')}</Link></p>
            </div>
        </main>
    );
}
