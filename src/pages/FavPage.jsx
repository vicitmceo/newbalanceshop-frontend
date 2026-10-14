import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useShop } from '../context/ShopContext.jsx';

export default function FavPage() {
    const { t, i18n } = useTranslation();
    const { favorites } = useShop();
    const [products, setProducts] = useState(null);

    useEffect(() => {
        api('/api/Products', { lang: i18n.language }).then(setProducts).catch(() => setProducts([]));
    }, [i18n.language]);

    const items = (products ?? []).filter((p) => favorites.includes(p.id));

    return (
        <main className="main">
            <div className="panel-head"><h2>{t('fav.title')}</h2></div>
            {products === null ? (
                <div className="loader"><div className="spinner" /><span>{t('common.loading')}</span></div>
            ) : items.length === 0 ? (
                <>
                    <p className="empty">{t('fav.empty')}</p>
                    <p className="center"><Link className="btn btn-primary" to="/">{t('hero.cta')}</Link></p>
                </>
            ) : (
                <div className="grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
            )}
        </main>
    );
}
