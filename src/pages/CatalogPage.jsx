import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import { compareSizes, sizesOf } from '../gallery.js';
import { useShop } from '../context/ShopContext.jsx';

const CATEGORY_IDS = [1, 2, 3];
const GENDERS = ['men', 'women', 'kids'];

// Плитки на головній: (ключ, кадр товару, посилання)
const HOME_TILES = [
    { key: 'men', img: '/images/nb/m10808mp-1.jpg', to: '/?g=men' },
    { key: 'women', img: '/images/nb/w10807pk-1.jpg', to: '/?g=women' },
    { key: 'kids', img: '/images/nb/g9060793-1.jpg', to: '/?g=kids' },
    { key: 'sale', img: '/images/nb/u530scw-1.jpg', to: '/?sale=1' },
];

// Усі фільтри живуть в адресі, тож результат можна скопіювати посиланням.
export default function CatalogPage() {
    const { t, i18n } = useTranslation();
    const { errorText } = useShop();
    const [params, setParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [slow, setSlow] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const g = params.get('g') || '';
    const sale = params.get('sale') || '';
    const isNew = params.get('new') || '';
    const type = params.get('type') || '';
    const cat = params.get('cat') || '';
    const sort = params.get('sort') || '';
    const min = params.get('min') || '';
    const max = params.get('max') || '';
    const size = params.get('size') || '';
    const q = params.get('q') || '';

    const isHome = !(g || sale || isNew || type || cat || q);

    const setParam = (key, value) => {
        const next = new URLSearchParams(params);
        if (value) next.set(key, value); else next.delete(key);
        setParams(next, { replace: true });
    };

    useEffect(() => {
        api('/api/Products').then(setAllProducts).catch(() => {});
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        const query = new URLSearchParams();
        if (cat) query.set('categoryId', cat);
        if (g) query.set('gender', g);
        if (sale) query.set('sale', 'true');
        if (type) query.set('type', type);
        if (q) query.set('q', q);
        if (min) query.set('minPrice', min);
        if (max) query.set('maxPrice', max);
        if (size) query.set('size', size);
        if (sort) query.set('sort', sort);
        api(`/api/Products${query.size ? `?${query}` : ''}`, { lang: i18n.language })
            .then((data) => { if (!cancelled) setProducts(data); })
            .catch((err) => { if (!cancelled) setError(errorText(err)); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [cat, g, sale, type, q, min, max, size, sort, i18n.language, errorText]);

    useEffect(() => {
        if (!loading) { setSlow(false); return undefined; }
        const id = setTimeout(() => setSlow(true), 5000);
        return () => clearTimeout(id);
    }, [loading]);

    const scope = useMemo(() => allProducts.filter((p) => !g || p.gender === g || (p.gender === 'unisex' && g !== 'kids')), [allProducts, g]);
    const types = useMemo(() => [...new Set(scope.map((p) => p.productType).filter(Boolean))].sort(), [scope]);
    const sizes = useMemo(() => [...new Set(scope.flatMap(sizesOf))].sort(compareSizes), [scope]);
    const newIds = useMemo(() => new Set([...allProducts].sort((a, b) => b.id - a.id).slice(0, 12).map((p) => p.id)), [allProducts]);

    const shown = useMemo(() => (isNew ? products.filter((p) => newIds.has(p.id)) : products), [products, isNew, newIds]);
    const trending = useMemo(() => [...allProducts].filter((p) => p.stock > 0).slice(0, 8), [allProducts]);
    const hasFilters = Boolean(type || cat || min || max || size || sort || q);
    const reset = () => { const next = new URLSearchParams(); if (g) next.set('g', g); if (sale) next.set('sale', sale); if (isNew) next.set('new', isNew); setParams(next, { replace: true }); };

    const title = q ? `“${q}”` : sale ? t('nb.sale') : isNew ? t('nb.new') : g ? t(`nb.${g}`) : t('catalog.title');

    if (isHome) {
        return (
            <main className="home">
                <section className="home-hero">
                    <img className="home-hero-img" src="/images/nb/u9060493-1.jpg" alt="" />
                    <div className="home-hero-text">
                        <h1>{t('nb.heroTitle')}</h1>
                        <p>{t('nb.heroText')}</p>
                        <div className="home-hero-cta">
                            <Link className="btn-light" to="/?g=men">{t('nb.men')}</Link>
                            <Link className="btn-light" to="/?g=women">{t('nb.women')}</Link>
                            <Link className="btn-light" to="/?g=kids">{t('nb.kids')}</Link>
                        </div>
                    </div>
                </section>

                <section className="home-tiles">
                    {HOME_TILES.map((tile) => (
                        <Link key={tile.key} to={tile.to} className="home-tile">
                            <img src={tile.img} alt="" loading="lazy" />
                            <span>{t(`nb.${tile.key}`)}</span>
                        </Link>
                    ))}
                </section>

                <section className="home-section">
                    <div className="section-head">
                        <h2>{t('nb.trending')}</h2>
                        <Link className="link-under" to="/?new=1">{t('nb.shopAll')}</Link>
                    </div>
                    {loading && !trending.length ? (
                        <div className="loader"><div className="spinner" /><span>{slow ? t('common.waking') : t('common.loading')}</span></div>
                    ) : (
                        <div className="grid">{trending.map((p) => <ProductCard key={p.id} product={p} isNew={newIds.has(p.id)} />)}</div>
                    )}
                </section>
            </main>
        );
    }

    return (
        <main className="plp">
            <nav className="crumbs" aria-label="breadcrumb">
                <Link to="/">{t('catalog.title')}</Link>
                {g && <><span>/</span><span>{t(`nb.${g}`)}</span></>}
            </nav>
            <div className="plp-title">
                <h1>{title}</h1>
                <span className="count">{shown.length}</span>
                <select className="sort-select" value={sort} onChange={(e) => setParam('sort', e.target.value)} aria-label={t('catalog.sort')}>
                    <option value="">{t('catalog.sortDefault')}</option>
                    <option value="price_asc">{t('catalog.sortPriceAsc')}</option>
                    <option value="price_desc">{t('catalog.sortPriceDesc')}</option>
                    <option value="name">{t('catalog.sortName')}</option>
                </select>
            </div>

            <div className="plp-body">
                <button type="button" className="filters-toggle" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>{t('nb.filters')} {filtersOpen ? '−' : '+'}</button>
                <aside className={`plp-filters ${filtersOpen ? 'open' : ''}`}>
                    <h3>{t('nb.filters')}</h3>
                    <fieldset>
                        <legend>{t('nb.gender')}</legend>
                        {GENDERS.map((x) => (
                            <button key={x} className={`opt ${g === x ? 'on' : ''}`} onClick={() => setParam('g', g === x ? '' : x)}>{t(`nb.${x}`)}</button>
                        ))}
                    </fieldset>
                    <fieldset>
                        <legend>{t('catalog.title')}</legend>
                        {CATEGORY_IDS.map((id) => (
                            <button key={id} className={`opt ${cat === String(id) ? 'on' : ''}`} onClick={() => setParam('cat', cat === String(id) ? '' : String(id))}>{t(`categories.${id}`)}</button>
                        ))}
                    </fieldset>
                    {types.length > 0 && (
                        <fieldset>
                            <legend>{t('nb.type')}</legend>
                            {types.map((x) => (
                                <button key={x} className={`opt ${type === x ? 'on' : ''}`} onClick={() => setParam('type', type === x ? '' : x)}>{x}</button>
                            ))}
                        </fieldset>
                    )}
                    <fieldset>
                        <legend>{t('nb.sizeLabel')}</legend>
                        <div className="size-grid">
                            {sizes.map((s) => (
                                <button key={s} className={`size-chip ${size === s ? 'active' : ''}`} onClick={() => setParam('size', size === s ? '' : s)}>{s}</button>
                            ))}
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>{t('catalog.priceFrom')} / {t('catalog.priceTo')}</legend>
                        <div className="price-row">
                            <input className="input" type="number" min="0" inputMode="numeric" value={min} onChange={(e) => setParam('min', e.target.value)} placeholder={t('catalog.priceFrom')} aria-label={t('catalog.priceFrom')} />
                            <input className="input" type="number" min="0" inputMode="numeric" value={max} onChange={(e) => setParam('max', e.target.value)} placeholder={t('catalog.priceTo')} aria-label={t('catalog.priceTo')} />
                        </div>
                    </fieldset>
                    {hasFilters && <button className="btn btn-ghost btn-block" onClick={reset}>{t('catalog.reset')}</button>}
                </aside>

                <section className="plp-results">
                    {error && (
                        <div className="alert">
                            {error} <button className="link-btn" onClick={() => setParams(new URLSearchParams(params), { replace: true })}>{t('common.retry')}</button>
                        </div>
                    )}
                    {loading ? (
                        <div className="loader"><div className="spinner" /><span>{slow ? t('common.waking') : t('common.loading')}</span></div>
                    ) : shown.length === 0 && !error ? (
                        <p className="empty">{t('catalog.empty')}</p>
                    ) : (
                        <div className="grid">{shown.map((p) => <ProductCard key={p.id} product={p} isNew={newIds.has(p.id)} />)}</div>
                    )}
                </section>
            </div>
        </main>
    );
}
