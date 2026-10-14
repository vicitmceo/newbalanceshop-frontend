import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductImage from './ProductImage.jsx';
import { useMoney } from './useMoney.js';
import { sizesOf } from '../gallery.js';
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

function HeartIcon({ filled }) {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
            <path d="M12 20.5s-8-4.9-8-11A4.6 4.6 0 0 1 8.6 5c1.5 0 2.7.7 3.4 1.8C12.7 5.7 13.9 5 15.4 5A4.6 4.6 0 0 1 20 9.5c0 6.1-8 11-8 11z" />
        </svg>
    );
}

export default function ProductCard({ product, isNew = false }) {
    const { t } = useTranslation();
    const money = useMoney();
    const { addToCart, notify, errorText, favorites, toggleFavorite } = useShop();
    const sizes = sizesOf(product);
    const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : '');
    const [needSize, setNeedSize] = useState(false);
    const fav = favorites.includes(product.id);
    const stock = stockLabel(t, product.stock);

    const add = async () => {
        if (sizes.length > 1 && !size) {
            setNeedSize(true);
            notify(t('product.chooseSizeFull'), 'error');
            return;
        }
        try {
            await addToCart(product.id, 1, size);
            notify(`${t('product.added')}: ${product.name}${size && sizes.length > 1 ? ` (${size})` : ''}`, 'success');
        } catch (err) {
            notify(errorText(err), 'error');
        }
    };

    const toggleFav = () => {
        toggleFavorite(product.id);
        notify(fav ? t('product.removedFav') : t('product.addedFav'), 'info');
    };

    return (
        <article className="card">
            <div className="card-thumb">
                {isNew && <span className="card-badge">{t('catalog.newBadge')}</span>}
                <button
                    className={`fav-btn ${fav ? 'is-fav' : ''}`}
                    onClick={toggleFav}
                    aria-pressed={fav}
                    aria-label={fav ? t('product.removeFav') : t('product.addFav')}
                    title={fav ? t('product.removeFav') : t('product.addFav')}
                >
                    <HeartIcon filled={fav} />
                </button>
                <Link to={`/product/${product.id}`} className="card-thumb-link" aria-label={product.name}>
                    <ProductImage product={product} />
                </Link>
            </div>
            <div className="card-body">
                <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
                <p className="brand-name">{product.brand} · {colorLabel(t, product.color)}</p>
                <p className={`stock stock-${stock.tone}`}>{stock.text}</p>

                {sizes.length > 1 && (
                    <div className={`card-sizes ${needSize && !size ? 'sizes-error' : ''}`} role="radiogroup" aria-label={t('product.size')}>
                        {sizes.map((sz) => (
                            <button
                                key={sz}
                                type="button"
                                role="radio"
                                aria-checked={size === sz}
                                className={`size-chip size-chip-sm ${size === sz ? 'active' : ''}`}
                                onClick={() => { setSize(sz); setNeedSize(false); }}
                            >
                                {sz}
                            </button>
                        ))}
                    </div>
                )}

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
