// Немає прав на реальні фотографії New Balance, а хотлінк чужих product-фото
// з логотипами конкурентів (Nike тощо) виглядає гірше за будь-який плейсхолдер.
// Тому картка товару — це не спроба намалювати "фото" силуетом (виходить
// невиразна ляпка), а свідомо графічний, типографський блок: великий код
// моделі на кольоровому тлі, як роблять багато мінімалістичних каталогів.
const PALETTES = {
    сірий: { from: '#7d838c', to: '#4b4f57', ink: '#ffffff' },
    білий: { from: '#f4f4f4', to: '#dcdcdc', ink: '#111111' },
    чорний: { from: '#2a2a2a', to: '#0c0c0c', ink: '#ffffff' },
    default: { from: '#c9c9c9', to: '#9a9a9a', ink: '#111111' },
};

function paletteFor(colorLabel) {
    const key = (colorLabel || '').trim().toLowerCase();
    return PALETTES[key] || PALETTES.default;
}

function codeFor(name) {
    const numberMatch = (name || '').match(/\d{2,4}/);
    if (numberMatch) return numberMatch[0];

    const letters = (name || '')
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
    return letters.slice(0, 3) || 'NB';
}

export default function ProductArt({ name, color }) {
    const palette = paletteFor(color);
    const code = codeFor(name);
    const gradientId = `pa-grad-${code}-${palette.from.replace('#', '')}`;

    return (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={palette.from} />
                    <stop offset="100%" stopColor={palette.to} />
                </linearGradient>
            </defs>
            <rect width="200" height="200" fill={`url(#${gradientId})`} />
            <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={palette.ink}
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontWeight="800"
                fontSize={code.length > 2 ? 46 : 60}
                letterSpacing="-1"
            >
                {code}
            </text>
            <text
                x="50%"
                y="78%"
                textAnchor="middle"
                fill={palette.ink}
                fillOpacity="0.6"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontWeight="700"
                fontSize="11"
                letterSpacing="2"
            >
                NEW BALANCE
            </text>
        </svg>
    );
}
