import { Route, Routes, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderPage from './pages/OrderPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import FavPage from './pages/FavPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import './App.css';
import './ui.css';
import './nb.css';

function NotFound() {
    const { t } = useTranslation();
    return (
        <main className="main narrow">
            <p className="empty">{t('errors.notFoundPage')}</p>
            <p className="center"><Link className="btn btn-primary" to="/">{t('product.back')}</Link></p>
        </main>
    );
}

// Маршрути сайту: / каталог, /product/:id, /cart, /order, /orders, /fav, /login, /register, /account, /admin
export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/order" element={<OrderPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/fav" element={<FavPage />} />
                <Route path="/login" element={<LoginPage initialMode="login" />} />
                <Route path="/register" element={<LoginPage initialMode="register" />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
