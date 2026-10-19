import { useTranslation } from 'react-i18next';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/firebase.js';
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
            notify(err?.status ? errorText(err) : `${t('auth.googleFailed')}${err?.code ? ` (${err.code})` : ''}`, 'error');
        }
    };


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
        </div>
    );
}
