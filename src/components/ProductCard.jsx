import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductImage from './ProductImage.jsx';
import { useMoney } from './useMoney.js';
import { useShop } from '../context/ShopContext.jsx';

export function colorLabel(t, color) {
    const key = `colors.${color}`;
    const text = t(key);
    return text === key ? color : text;
}

export function stockLabel(t, stock) {
    if (stock <= 0) return { text: t('catalog.outOfStock'), tone: 'out' };
    if (stock <= 5) return { text: t('catalog.lowStock', { count: stock }), tone: 'low' };
    return { text: t('catalog.inStock'), tone: 'ok' };
}

export default function ProductCard({ product, isNew = false }) {
    const { t } = useTranslation();
    const money = useMoney();
    const { addToCart, notify, errorText, favorites, toggleFavorite } = useShop();
    const fav = favorites.includes(product.id);
    const stock = stockLabel(t, product.stock);

    const add = async () => {
        try {
            await addToCart(product.id, 1);
            notify(`${t('product.added')}: ${product.name}`, 'success');
        } catch (err) {
            notify(errorText(err), 'error');
        }
    };

    return (
        <article className="card">
            <div className="card-thumb">
                {isNew && <span className="card-badge">{t('catalog.newBadge')}</span>}
                <button
                    className={`fav-btn ${fav ? 'is-fav' : ''}`}
                    onClick={() => toggleFavorite(product.id)}
                    aria-pressed={fav}
                    aria-label={fav ? t('product.removeFav') : t('product.addFav')}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" strokeLinejoin="round" />
                    </svg>
                </button>
                <Link to={`/product/${product.id}`} className="card-thumb-link" aria-label={product.name}>
                    <ProductImage product={product} />
                </Link>
            </div>
            <div className="card-body">
                <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
                <p className="brand-name">{product.brand}</p>
                <p className="meta">{t('catalog.size')} {product.size} · {colorLabel(t, product.color)}</p>
                <p className={`stock stock-${stock.tone}`}>{stock.text}</p>
                <div className="card-footer">
                    <span className="price">{money(product.price)}</span>
                    <button className="btn btn-primary" onClick={add} disabled={product.stock <= 0}>
                        {t('catalog.addToCart')}
                    </button>
                </div>
            </div>
        </article>
    );
}
