import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, ApiError } from '../api.js';
import ProductImage from '../components/ProductImage.jsx';
import ProductCard, { colorLabel, stockLabel } from '../components/ProductCard.jsx';
import { useMoney } from '../components/useMoney.js';
import { creditFor, galleryFor, sizesOf } from '../gallery.js';
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
    const [size, setSize] = useState('');
    const [sizeError, setSizeError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setStatus('loading');
        setView(0);
        setQty(1);
        setSize('');
        setSizeError(false);
        api(`/api/Products/${id}`, { lang: i18n.language })
            .then((p) => {
                if (cancelled) return;
                setProduct(p);
                if (sizesOf(p).length === 1) setSize(sizesOf(p)[0]);
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
    const sizes = sizesOf(product);
    const frames = galleryFor(product);
    const frame = frames[view] ?? frames[0];
    const credit = creditFor(frame.src);
    const inCart = cart.filter((i) => i.productId === product.id).reduce((sum, i) => sum + i.quantity, 0);
    const maxQty = Math.max(0, product.stock - inCart);
    const fav = favorites.includes(product.id);
    const hasRealGallery = frames.every((f) => f.view === 0);
    const viewLabels = [t('product.view1'), t('product.view2'), t('product.view3')];

    const add = async () => {
        if (sizes.length > 1 && !size) {
            setSizeError(true);
            return;
        }
        try {
            await addToCart(product.id, qty, size);
            notify(`${t('product.added')}: ${product.name}${size && sizes.length > 1 ? ` (${size})` : ''} × ${qty}`, 'success');
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
                        <ProductImage product={product} image={frame} eager />
                    </div>
                    <div className="gallery-thumbs" role="tablist" aria-label="photos">
                        {frames.map((f, i) => (
                            <button
                                key={`${f.src}-${f.view}-${i}`}
                                role="tab"
                                aria-selected={view === i}
                                className={`thumb ${view === i ? 'active' : ''}`}
                                onClick={() => setView(i)}
                                title={hasRealGallery ? `${i + 1}` : viewLabels[i]}
                            >
                                <ProductImage product={product} image={f} />
                                {!hasRealGallery && <span className="thumb-label">{viewLabels[i]}</span>}
                            </button>
                        ))}
                    </div>
                    {credit && <p className="photo-note">{t('product.photoBy', { author: credit })}</p>}
                    {!hasRealGallery && <p className="photo-note">{t('product.photoNote')}</p>}
                </div>

                <div className="pdp-info">
                    <p className="brand-name">{product.brand}</p>
                    <h1 className="pdp-title">{product.name}</h1>
                    <p className="pdp-price">{money(product.price)}{product.oldPrice > product.price && <s className="price-old" style={{ marginLeft: 12, fontSize: 18 }}>{money(product.oldPrice)}</s>}</p>
                    <p className={`stock stock-${stock.tone}`}>{stock.text}</p>

                    <h2 className="pdp-h">{t('product.description')}</h2>
                    <p className="pdp-desc">{product.description}</p>

                    <h2 className="pdp-h">{t('product.specs')}</h2>
                    <dl className="specs">
                        <dt>{t('product.category')}</dt><dd>{t(`categories.${product.categoryId}`)}</dd>
                        <dt>{t('catalog.brand')}</dt><dd>{product.brand}</dd>
                        <dt>{t('catalog.sizes')}</dt><dd>{sizes.join(', ')}</dd>
                        {product.color && <><dt>{t('product.color')}</dt><dd>{colorLabel(t, product.color)}</dd></>}
                    </dl>

                    {sizes.length > 1 && (
                        <>
                            <h2 className="pdp-h">{t('product.size')}{sizeError && <span className="size-error"> — {t('product.chooseSize')}</span>}</h2>
                            <div className={`sizes ${sizeError ? 'sizes-error' : ''}`} role="radiogroup" aria-label={t('product.size')}>
                                {sizes.map((sz) => (
                                    <button
                                        key={sz}
                                        role="radio"
                                        aria-checked={size === sz}
                                        className={`size-chip ${size === sz ? 'active' : ''}`}
                                        onClick={() => { setSize(sz); setSizeError(false); }}
                                    >
                                        {sz}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

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
