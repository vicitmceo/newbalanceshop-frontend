import { useState } from 'react';
import ProductArt from './ProductArt.jsx';

// Кадрування: загальний план і два збільшені фрагменти (логотип і низ) однієї фотографії.
export const VIEWS = [
    { scale: 1, x: 50, y: 50 },
    { scale: 2.3, x: 38, y: 42 },
    { scale: 2.3, x: 62, y: 84 },
];

// image = { src, view } з galleryFor(); без нього показується головне фото товару.
export default function ProductImage({ product, image, className = '', eager = false }) {
    const [failed, setFailed] = useState(false);
    const src = image ? image.src : product.imageUrl;
    const v = VIEWS[image?.view ?? 0] ?? VIEWS[0];
    const style = v.scale === 1 ? undefined : { transform: `scale(${v.scale})`, transformOrigin: `${v.x}% ${v.y}%` };
    const hasPhoto = src && !failed;

    return (
        <div className={`pimg ${className}`}>
            {hasPhoto ? (
                <img
                    src={src}
                    alt={product.name}
                    style={style}
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => setFailed(true)}
                />
            ) : (
                <div className="pimg-art" style={style}>
                    <ProductArt name={product.name} color={product.color} categoryId={product.categoryId} />
                </div>
            )}
        </div>
    );
}
