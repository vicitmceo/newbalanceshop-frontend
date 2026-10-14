import { useState } from 'react';
import ProductArt from './ProductArt.jsx';

// Три «кадри» товару: загальний план і два збільшених фрагменти (логотип і низ).
// Окремих ракурсів у вільних джерелах немає, тому деталі — це кадрування однієї фотографії.
export const VIEWS = [
    { scale: 1, x: 50, y: 50 },
    { scale: 2.3, x: 38, y: 42 },
    { scale: 2.3, x: 62, y: 84 },
];

export default function ProductImage({ product, view = 0, className = '', eager = false }) {
    const [failed, setFailed] = useState(false);
    const v = VIEWS[view] ?? VIEWS[0];
    const style = { transform: `scale(${v.scale})`, transformOrigin: `${v.x}% ${v.y}%` };
    const hasPhoto = product.imageUrl && !failed;

    return (
        <div className={`pimg ${className}`}>
            {hasPhoto ? (
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={style}
                    loading={eager ? 'eager' : 'lazy'}
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
