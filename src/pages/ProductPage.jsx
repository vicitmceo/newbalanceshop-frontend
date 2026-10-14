import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, ApiError } from '../api.js';
import ProductImage from '../components/ProductImage.jsx';
import ProductCard, { colorLabel, stockLabel } from '../components/ProductCard.jsx';
import { useMoney } from '../components/useMoney.js';
import { useShop } from '../context/ShopContext.jsx';

export default function ProductPage() {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const money = useMoney();
    const { addToCart, notify, errorText, favorites, toggleFavorite, cart } = useShop();
    const [product, setProduct] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [status, setStatus] = useState('loading');
    const [view, setView] = useState(0);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        let cancelled = false;
        setStatus('loading');
        setView(0);
        setQty(1);
        api(`/api/Products/${id}`, { lang: i18n.language })
            .then((p) => {
                if (cancelled) return;
                setProduct(p);
                setStatus('ok');
                api(`/api/Products?categoryId=${p.categoryId}`)
                    .then((list) => { if (!cancelled) setSimilar(list.filter((x) => x.id !== p.id).slice(0, 4)); })
                    .catch(() => {});
            })
            .catch((err) => { if (!cancelled) setStatus(err instanceof ApiError && err.status === 404 ? 'missing' : 'error'); });
        return () => { cancelled = true; };
    }, [id, i18n.language]);

    if (status === 'loading') return <main className="main"><div className="loader"><div className="spinner" /><span>{t('common.loading')}</span></div></main>;
    if (status !== 'ok') {
        return (
            <main className="main">
                <p className="empty">{status === 'missing' ? t('product.notFound') : t('errors.generic')}</p>
                <p className="center"><Link className="btn btn-primary" to="/">{t('product.back')}</Link></p>
            </main>
        );
    }

    const stock = stockLabel(t, product.stock);
    const inCart = cart.find((i) => i.productId === product.id)?.quantity ?? 0;
    const maxQty = Math.max(0, product.stock - inCart);
    const fav = favorites.includes(product.id);
    const views = [t('product.view1'), t('product.view2'), t('product.view3')];

    const add = async () => {
        try {
            await addToCart(product.id, qty);
            notify(`${t('product.added')}: ${product.name} × ${qty}`, 'success');
            setQty(1);
        } catch (err) {
            notify(errorText(err), 'error');
        }
    };

    return (
        <main className="main">
            <nav className="crumbs" aria-label="breadcrumb">
                <Link to="/">{t('nav.catalog')}</Link>
                <span>/</span>
                <Link to={`/?cat=${product.categoryId}`}>{t(`categories.${product.categoryId}`)}</Link>
                <span>/</span>
                <span aria-current="page">{product.name}</span>
            </nav>

            <div className="pdp">
                <div className="gallery">
                    <div className="gallery-main">
                        <ProductImage product={product} view={view} eager />
                    </div>
                    <div className="gallery-thumbs" role="tablist" aria-label="photos">
                        {views.map((label, i) => (
                            <button
                                key={label}
                                role="tab"
                                aria-selected={view === i}
                                className={`thumb ${view === i ? 'active' : ''}`}
                                onClick={() => setView(i)}
                                title={label}
                            >
                                <ProductImage product={product} view={i} />
                                <span className="thumb-label">{label}</span>
                            </button>
                        ))}
                    </div>
                    {product.imageUrl && <p className="photo-note">{t('product.photoNote')}</p>}
                </div>

                <div className="pdp-info">
                    <p className="brand-name">{product.brand}</p>
                    <h1 className="pdp-title">{product.name}</h1>
                    <p className="pdp-price">{money(product.price)}</p>
                    <p className={`stock stock-${stock.tone}`}>{stock.text}</p>

                    <h2 className="pdp-h">{t('product.description')}</h2>
                    <p className="pdp-desc">{product.description}</p>

                    <h2 className="pdp-h">{t('product.specs')}</h2>
                    <dl className="specs">
                        <dt>{t('product.category')}</dt><dd>{t(`categories.${product.categoryId}`)}</dd>
                        <dt>{t('catalog.brand')}</dt><dd>{product.brand}</dd>
                        <dt>{t('catalog.size')}</dt><dd>{product.size}</dd>
                        <dt>{t('product.color')}</dt><dd>{colorLabel(t, product.color)}</dd>
                    </dl>

                    <div className="buy-row">
                        <div className="qty" aria-label={t('product.quantity')}>
                            <button onClick={() => setQty((n) => Math.max(1, n - 1))} disabled={qty <= 1} aria-label="-">−</button>
                            <span>{maxQty === 0 ? 0 : qty}</span>
                            <button onClick={() => setQty((n) => Math.min(maxQty, n + 1))} disabled={qty >= maxQty} aria-label="+">+</button>
                        </div>
                        <button className="btn btn-primary btn-large" onClick={add} disabled={maxQty === 0}>
                            {t('catalog.addToCart')}
                        </button>
                        <button
                            className={`btn btn-ghost btn-large ${fav ? 'is-fav' : ''}`}
                            onClick={() => toggleFavorite(product.id)}
                            aria-pressed={fav}
                        >
                            {fav ? '♥' : '♡'} {fav ? t('product.removeFav') : t('product.addFav')}
                        </button>
                    </div>
                </div>
            </div>

            {similar.length > 0 && (
                <section className="similar">
                    <h2>{t('product.similar')}</h2>
                    <div className="grid">{similar.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                </section>
            )}
        </main>
    );
}
