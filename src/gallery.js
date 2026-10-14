// Фото-атрибуція для файлів з ліцензією, що вимагає вказати автора (CC0 не вимагає).
const CREDITS = {
    '/images/nb574-b.jpg': 'MIKI Yoshihito, CC BY 2.0',
    '/images/nb574-c.jpg': 'MIKI Yoshihito, CC BY 2.0',
    '/images/nb990w.jpg': 'slgckgc, CC BY 2.0',
    '/images/nb-freshfoam.jpg': 'Ser Amantio di Nicolao, CC BY-SA 4.0',
    '/images/nb-trailmore.jpg': 'Ssu, CC BY-SA 4.0',
};

export function creditFor(src) {
    return CREDITS[src] || '';
}

// Кадри товару для галереї. Якщо реальних фото щонайменше три, показуємо їх;
// інакше доповнюємо збільшеними кадрами першого фото (логотип і низ) або трьома кадрами малюнка.
export function galleryFor(product) {
    const photos = [product.imageUrl, ...(product.extraImages || '').split(',')]
        .map((s) => (s || '').trim())
        .filter(Boolean);

    if (photos.length >= 3) return photos.map((src) => ({ src, view: 0 }));
    if (photos.length === 0) return [0, 1, 2].map((view) => ({ src: null, view }));

    const frames = photos.map((src) => ({ src, view: 0 }));
    for (let view = 1; frames.length < 3; view += 1) frames.push({ src: photos[0], view });
    return frames;
}

// Розміри товару зі списку через кому.
export function sizesOf(product) {
    return (product.size || '').split(',').map((s) => s.trim()).filter(Boolean);
}

export function sizeSummary(product) {
    const sizes = sizesOf(product);
    if (sizes.length <= 1) return sizes[0] || '';
    return `${sizes[0]}–${sizes[sizes.length - 1]}`;
}

export function compareSizes(a, b) {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    return String(a).localeCompare(String(b));
}
