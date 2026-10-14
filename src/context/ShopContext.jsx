import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { api, ApiError } from '../api.js';
import { auth } from '../firebase/firebase.js';

const ShopContext = createContext(null);

export function useShop() {
    return useContext(ShopContext);
}

const FAV_KEY = 'nbs.favorites';

function loadFavorites() {
    try {
        const raw = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
        return Array.isArray(raw) ? raw.filter((id) => Number.isInteger(id)) : [];
    } catch {
        return [];
    }
}

export function ShopProvider({ children }) {
    const { t, i18n } = useTranslation();
    const [customer, setCustomer] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState(loadFavorites);
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);

    const notify = useCallback((message, type = 'info') => {
        const id = ++toastId.current;
        setToasts((list) => [...list, { id, message, type }]);
        setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 3800);
    }, []);

    // Текст помилки для користувача: повідомлення сервера (воно вже зрозуміле) або загальний текст за кодом.
    const errorText = useCallback((err) => {
        if (!(err instanceof ApiError)) return t('errors.generic');
        if (err.status === 0) return t('errors.network');
        if (err.status === 400 && err.message && err.message !== '400') return err.message;
        if (err.status === 409 && err.message && err.message !== '409') return err.message;
        const key = `errors.e${err.status}`;
        const text = t(key);
        return text === key ? t('errors.generic') : text;
    }, [t]);

    const lang = i18n.language;

    const refreshMe = useCallback(async () => {
        try {
            const me = await api('/api/auth/me');
            setCustomer(me);
            return me;
        } catch {
            setCustomer(null);
            return null;
        } finally {
            setAuthReady(true);
        }
    }, []);

    const refreshCart = useCallback(async () => {
        try {
            setCart(await api('/api/Cart', { lang }));
        } catch {
            // кошик залишаємо як є: помилку покаже конкретна дія користувача
        }
    }, [lang]);

    useEffect(() => {
        refreshMe();
        refreshCart();
    }, [refreshMe, refreshCart]);

    // ---- автентифікація ----
    const login = useCallback(async (email, password) => {
        const me = await api('/api/auth/login', { method: 'POST', body: { email, password } });
        setCustomer(me);
        refreshCart();
        return me;
    }, [refreshCart]);

    const register = useCallback(async (dto) => {
        const me = await api('/api/auth/register', { method: 'POST', body: dto });
        // реєстрація не відкриває сесію сама, тож одразу входимо
        return login(dto.email, dto.password).catch(() => me);
    }, [login]);

    const loginGoogle = useCallback(async (idToken) => {
        const me = await api('/api/auth/google', { method: 'POST', body: { idToken } });
        setCustomer(me);
        refreshCart();
        return me;
    }, [refreshCart]);

    const logout = useCallback(async () => {
        try { await signOut(auth); } catch { /* Firebase міг не бути налаштований */ }
        try { await api('/api/auth/github/logout', { method: 'POST' }); } catch { /* немає GitHub-сесії */ }
        try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* сесія вже завершена */ }
        setCustomer(null);
    }, []);

    // ---- кошик ----
    const addToCart = useCallback(async (productId, quantity = 1, size = '') => {
        const data = await api('/api/Cart', { method: 'POST', body: { productId, quantity, size }, lang });
        setCart(data);
        return data;
    }, [lang]);

    const sizeQuery = (size) => (size ? `?size=${encodeURIComponent(size)}` : '');

    const setQuantity = useCallback(async (productId, quantity, size = '') => {
        const data = await api(`/api/Cart/${productId}${sizeQuery(size)}`, { method: 'PUT', body: { quantity }, lang });
        setCart(data);
    }, [lang]);

    const removeFromCart = useCallback(async (productId, size = '') => {
        setCart(await api(`/api/Cart/${productId}${sizeQuery(size)}`, { method: 'DELETE', lang }));
    }, [lang]);

    const clearCart = useCallback(async () => {
        let data = cart;
        for (const item of cart) {
            data = await api(`/api/Cart/${item.productId}${sizeQuery(item.size)}`, { method: 'DELETE', lang });
        }
        setCart(data);
    }, [cart, lang]);

    const checkout = useCallback(async () => {
        const order = await api('/api/Cart/checkout', { method: 'POST', lang });
        setCart([]);
        return order;
    }, [lang]);

    // ---- обране (зберігається в браузері) ----
    const toggleFavorite = useCallback((productId) => {
        setFavorites((list) => {
            const next = list.includes(productId) ? list.filter((id) => id !== productId) : [...list, productId];
            try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* приватний режим */ }
            return next;
        });
    }, []);

    const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);
    const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);

    const value = {
        customer, setCustomer, authReady, refreshMe,
        login, register, loginGoogle, logout,
        cart, cartCount, cartTotal, addToCart, setQuantity, removeFromCart, clearCart, checkout, refreshCart,
        favorites, toggleFavorite,
        toasts, notify, errorText,
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
