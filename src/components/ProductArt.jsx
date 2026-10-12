// Немає прав на реальні фотографії New Balance, тому картка товару — власна
// векторна ілюстрація: кросівок або худі, пофарбована під колір товару.
const PALETTES = {
    сірий: { body: '#868c95', dark: '#5b6068', sole: '#f1f1f1', accent: '#d8d8d8', ink: '#ffffff' },
    білий: { body: '#f7f7f7', dark: '#d9dadd', sole: '#ffffff', accent: '#1d3b6e', ink: '#1d3b6e' },
    чорний: { body: '#262626', dark: '#101010', sole: '#f1f1f1', accent: '#5a5a5a', ink: '#ffffff' },
    default: { body: '#b5b9bf', dark: '#8d9198', sole: '#f1f1f1', accent: '#d8d8d8', ink: '#ffffff' },
};

function paletteFor(colorLabel) {
    const key = (colorLabel || '').trim().toLowerCase();
    return PALETTES[key] || PALETTES.default;
}

function Sneaker({ p }) {
    return (
        <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" strokeLinejoin="round">
            <ellipse cx="102" cy="156" rx="78" ry="6" fill="rgba(0,0,0,0.16)" stroke="none" />
            {/* верх */}
            <path
                d="M30 130 L30 94 Q30 84 40 82 L62 78 Q70 64 84 60 L98 74 Q106 80 118 84 L148 92 Q174 98 180 120 L180 130 Z"
                fill={p.body}
            />
            {/* носок */}
            <path d="M138 90 Q172 96 180 120 L180 130 L134 130 Q146 112 138 90 Z" fill={p.dark} />
            {/* п'ята */}
            <path d="M30 100 L52 100 L52 130 L30 130 Z" fill={p.dark} />
            {/* язик */}
            <path d="M62 78 Q72 54 90 52 L98 74 Q82 70 62 78 Z" fill={p.accent} />
            {/* шнурівка */}
            <g stroke={p.ink} strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
                <line x1="92" y1="76" x2="102" y2="68" />
                <line x1="102" y1="82" x2="113" y2="74" />
                <line x1="113" y1="87" x2="124" y2="79" />
                <line x1="124" y1="91" x2="135" y2="84" />
            </g>
            {/* логотип N */}
            <path
                d="M72 124 L77 100 L96 124 L101 100"
                fill="none"
                stroke={p.ink}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.92"
            />
            {/* підошва */}
            <path d="M24 130 H186 Q190 150 170 152 H42 Q24 152 24 130 Z" fill={p.sole} />
            <path d="M28 140 H184" stroke={p.accent} strokeWidth="4" strokeLinecap="round" />
        </g>
    );
}

function Hoodie({ p }) {
    return (
        <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" strokeLinejoin="round">
            <ellipse cx="100" cy="170" rx="56" ry="5" fill="rgba(0,0,0,0.16)" stroke="none" />
            {/* рукави */}
            <path d="M66 64 L34 128 L52 138 L76 96 Z" fill={p.dark} />
            <path d="M134 64 L166 128 L148 138 L124 96 Z" fill={p.dark} />
            {/* корпус */}
            <path d="M66 64 Q100 82 134 64 L144 166 Q100 174 56 166 Z" fill={p.body} />
            {/* капюшон */}
            <path d="M70 62 Q100 24 130 62 Q100 80 70 62 Z" fill={p.dark} />
            <path d="M82 62 Q100 44 118 62 Q100 74 82 62 Z" fill="rgba(0,0,0,0.35)" stroke="none" />
            {/* шнурки */}
            <g stroke={p.ink} strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
                <line x1="93" y1="74" x2="92" y2="104" />
                <line x1="107" y1="74" x2="108" y2="104" />
            </g>
            {/* логотип */}
            <text
                x="100"
                y="124"
                textAnchor="middle"
                fill={p.ink}
                stroke="none"
                fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                fontWeight="800"
                fontSize="15"
                letterSpacing="1"
            >
                NB
            </text>
            {/* кишеня */}
            <path d="M76 136 H124 L132 160 H68 Z" fill={p.dark} opacity="0.55" />
            {/* манжети */}
            <path d="M34 128 L52 138 L49 144 L30 134 Z" fill={p.accent} />
            <path d="M166 128 L148 138 L151 144 L170 134 Z" fill={p.accent} />
        </g>
    );
}

export default function ProductArt({ name, color, categoryId }) {
    const palette = paletteFor(color);
    const lower = (name || '').toLowerCase();
    const isApparel = categoryId ? categoryId !== 1 : /hood|худі|jacket|tee/.test(lower);
    const bgId = `pa-bg-${isApparel ? 'a' : 's'}-${(color || 'x').replace(/\W/g, '')}`;

    return (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={name}>
            <defs>
                <radialGradient id={bgId} cx="50%" cy="40%" r="75%">
                    <stop offset="0%" stopColor="#f4f5f7" />
                    <stop offset="100%" stopColor="#c9ced6" />
                </radialGradient>
            </defs>
            <rect width="200" height="200" fill={`url(#${bgId})`} />
            {isApparel ? <Hoodie p={palette} /> : <Sneaker p={palette} />}
        </svg>
    );
}
