import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// значення беруться з .env (VITE_FIREBASE_*, див. .env.example) — реальний
// ключ у репозиторій не кладемо, тільки у Vercel Environment Variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// без реального ключа getAuth кидає виняток одразу при виклику й зносить
// увесь рендер додатку — тож поки Firebase не налаштовано, auth/googleProvider
// лишаються null, а кнопка входу через Google просто показує помилку при кліку
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

let auth = null;
let googleProvider = null;
if (isFirebaseConfigured) {
    const firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();
}

export { auth, googleProvider };
