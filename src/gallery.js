// Фото-атрибуція для файлів з ліцензією, що вимагає вказати автора (CC0 не вимагає).
const CREDITS = {
    '/images/nb574-b.jpg': 'MIKI Yoshihito, CC BY 2.0',
    '/images/nb574-c.jpg': 'MIKI Yoshihito, CC BY 2.0',
    '/images/nb990w.jpg': 'slgckgc, CC BY 2.0',
    '/images/nb-freshfoam.jpg': 'Ser Amantio di Nicolao, CC BY-SA 4.0',
    '/images/nb-trailmore.jpg': 'Ssu, CC BY-SA 4.0',
    '/images/nb-beanie.jpg': 'ajay_suresh, CC BY 2.0',
    '/images/nb-hoodie-life.jpg': 'Patryk Sobczak, CC0',
    '/images/nb-jacket-life.jpg': 'Stephen Arnold, CC0',
    '/images/nb-run-life.jpg': 'Alex wong, CC0',
};

export function creditFor(src) {
    return CREDITS[src] || '';
}

// Кадри товару для галереї: головне зображення (фото або малюнок), додаткові фото з ExtraImages
// і, якщо кадрів менше трьох, збільшені фрагменти головного зображення (логотип і низ).
export function galleryFor(product) {
    const main = (product.imageUrl || '').trim() || null;
    const extras = (product.extraImages || '').split(',').map((x) => x.trim()).filter(Boolean);
    const frames = [{ src: main, view: 0 }, ...extras.map((src) => ({ src, view: 0 }))];
    for (let view = 1; frames.length < 3; view += 1) frames.push({ src: main, view });
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
