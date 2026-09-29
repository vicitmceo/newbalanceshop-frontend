import { useTranslation } from 'react-i18next';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/firebase.js';

export default function GoogleLoginButton({ customer, onLogin, onLogout, apiBaseUrl }) {
    const { t } = useTranslation();

    const handleLogin = async () => {
        if (!isFirebaseConfigured) {
            alert('Firebase не налаштовано: додайте VITE_FIREBASE_* у .env');
            return;
        }
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();

        const response = await fetch(`${apiBaseUrl}/api/auth/google`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });
        if (!response.ok) throw new Error(String(response.status));

        onLogin(await response.json());
    };

    const handleLogout = async () => {
        await signOut(auth);
        await fetch(`${apiBaseUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        onLogout();
    };

    if (customer) {
        return (
            <div className="auth-box">
                <span className="auth-hello">{t('auth.hello', { name: customer.fullName })}</span>
                <button className="btn btn-ghost" onClick={handleLogout}>{t('auth.logout')}</button>
            </div>
        );
    }

    return (
        <button className="btn btn-google" onClick={handleLogin}>
            {t('auth.googleLogin')}
        </button>
    );
}
