import { useTranslation } from 'react-i18next';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/firebase.js';
import { API_BASE_URL } from '../api.js';
import { useShop } from '../context/ShopContext.jsx';

// Вхід через Google (Firebase) і GitHub (OAuth на бекенді). Після GitHub користувача
// повертає назад на цей самий сайт (returnUrl = поточний origin) і сторінка підхоплює сесію.
export default function SocialLogin({ onDone }) {
    const { t } = useTranslation();
    const { loginGoogle, notify, errorText } = useShop();

    const google = async () => {
        if (!isFirebaseConfigured) {
            notify(t('auth.firebaseOff'), 'error');
            return;
        }
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const me = await loginGoogle(idToken);
            notify(t('auth.welcome', { name: me.fullName }), 'success');
            onDone?.(me);
        } catch (err) {
            if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') return;
            notify(err?.status ? errorText(err) : t('auth.googleFailed'), 'error');
        }
    };

    const githubHref = `${API_BASE_URL}/api/auth/github/login?returnUrl=${encodeURIComponent(window.location.origin)}`;

    return (
        <div className="social">
            <button type="button" className="btn btn-social" onClick={google}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" />
                    <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5z" />
                    <path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3z" />
                    <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3C6.5 7.4 9 5.4 12 5.4z" />
                </svg>
                {t('auth.google')}
            </button>
            <a className="btn btn-social btn-social-dark" href={githubHref}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
                </svg>
                {t('auth.github')}
            </a>
        </div>
    );
}
