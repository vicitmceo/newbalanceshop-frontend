import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import { compareSizes, sizesOf } from '../gallery.js';
import { useShop } from '../context/ShopContext.jsx';

const CATEGORY_IDS = [1, 2, 3];

// Усі фільтри живуть в адресі (?q=&cat=&sort=&min=&max=&brand=&size=), тож результат можна скопіювати посиланням.
export default function CatalogPage() {
    const { t, i18n } = useTranslation();
    const { errorText } = useShop();
    const [params, setParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState(params.get('q') || '');

    const cat = params.get('cat') || '';
    const sort = params.get('sort') || '';
    const min = params.get('min') || '';
    const max = params.get('max') || '';
    const brand = params.get('brand') || '';
    const size = params.get('size') || '';
    const q = params.get('q') || '';

    const setParam = (key, value) => {
        const next = new URLSearchParams(params);
        if (value) next.set(key, value); else next.delete(key);
        setParams(next, { replace: true });
    };

    // пошук відправляємо на сервер із невеликою затримкою, щоб не слати запит на кожну літеру
    useEffect(() => {
        const id = setTimeout(() => { if (search !== q) setParam('q', search.trim()); }, 350);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // повний список потрібен лише для варіантів фільтрів (бренди, розміри)
    useEffect(() => {
        api('/api/Products').then(setAllProducts).catch(() => {});
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        const query = new URLSearchParams();
        if (cat) query.set('categoryId', cat);
        if (q) query.set('q', q);
        if (brand) query.set('brand', brand);
        if (min) query.set('minPrice', min);
        if (max) query.set('maxPrice', max);
        if (size) query.set('size', size);
        if (sort) query.set('sort', sort);
        api(`/api/Products${query.size ? `?${query}` : ''}`, { lang: i18n.language })
            .then((data) => { if (!cancelled) setProducts(data); })
            .catch((err) => { if (!cancelled) setError(errorText(err)); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [cat, q, brand, min, max, size, sort, i18n.language, errorText]);

    const brands = useMemo(() => [...new Set(allProducts.map((p) => p.brand))].sort(), [allProducts]);
    const sizes = useMemo(() => [...new Set(allProducts.flatMap(sizesOf))].sort(compareSizes), [allProducts]);
    const hasFilters = Boolean(cat || q || brand || min || max || size || sort);
    const newIds = useMemo(() => new Set([...allProducts].sort((a, b) => b.id - a.id).slice(0, 3).map((p) => p.id)), [allProducts]);

    const reset = () => { setSearch(''); setParams({}, { replace: true }); };

    return (
        <>
            <div className="hero">
                <div className="hero-photo" style={{ backgroundImage: "url(/images/nb1906r.jpg)" }} role="img" aria-label="New Balance 1906R" />
                <div className="hero-inner">
                    <span className="hero-eyebrow">{t('hero.eyebrow')}</span>
                    <h1 className="hero-title">{t('brand.subtitle')}</h1>
                    <p className="hero-subtitle">{t('hero.subtitle')}</p>
                </div>
            </div>

            <main className="main">
                <div className="panel-head">
                    <h2>{t('catalog.title')}</h2>
                    <span className="count">{t('catalog.count', { count: products.length })}</span>
                </div>

                <div className="chips" role="tablist">
                    <button className={`chip ${cat === '' ? 'active' : ''}`} onClick={() => setParam('cat', '')}>{t('catalog.allCategories')}</button>
                    {CATEGORY_IDS.map((id) => (
                        <button key={id} className={`chip ${cat === String(id) ? 'active' : ''}`} onClick={() => setParam('cat', String(id))}>
                            {t(`categories.${id}`)}
                        </button>
                    ))}
                </div>

                <div className="filters">
                    <input
                        className="input filter-search"
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('catalog.search')}
                        aria-label={t('catalog.search')}
                    />
                    <select className="input" value={brand} onChange={(e) => setParam('brand', e.target.value)} aria-label={t('catalog.brand')}>
                        <option value="">{t('catalog.allBrands')}</option>
                        {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select className="input" value={size} onChange={(e) => setParam('size', e.target.value)} aria-label={t('catalog.size')}>
                        <option value="">{t('catalog.allSizes')}</option>
                        {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input className="input filter-price" type="number" min="0" inputMode="numeric" value={min} onChange={(e) => setParam('min', e.target.value)} placeholder={t('catalog.priceFrom')} aria-label={t('catalog.priceFrom')} />
                    <input className="input filter-price" type="number" min="0" inputMode="numeric" value={max} onChange={(e) => setParam('max', e.target.value)} placeholder={t('catalog.priceTo')} aria-label={t('catalog.priceTo')} />
                    <select className="input" value={sort} onChange={(e) => setParam('sort', e.target.value)} aria-label={t('catalog.sort')}>
                        <option value="">{t('catalog.sortDefault')}</option>
                        <option value="price_asc">{t('catalog.sortPriceAsc')}</option>
                        <option value="price_desc">{t('catalog.sortPriceDesc')}</option>
                        <option value="name">{t('catalog.sortName')}</option>
                    </select>
                    {hasFilters && <button className="btn btn-ghost" onClick={reset}>{t('catalog.reset')}</button>}
                </div>

                {error && (
                    <div className="alert">
                        {error} <button className="link-btn" onClick={() => setParams(new URLSearchParams(params), { replace: true })}>{t('common.retry')}</button>
                    </div>
                )}

                {loading ? (
                    <div className="loader"><div className="spinner" /><span>{t('common.loading')}</span></div>
                ) : products.length === 0 && !error ? (
                    <p className="empty">{t('catalog.empty')}</p>
                ) : (
                    <div className="grid">
                        {products.map((p) => <ProductCard key={p.id} product={p} isNew={newIds.has(p.id)} />)}
                    </div>
                )}
            </main>
        </>
    );
}
