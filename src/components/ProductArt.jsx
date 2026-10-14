// Немає прав на реальні фотографії New Balance, тому картка товару — власна
// векторна ілюстрація: кросівок або худі, пофарбована під колір товару.
const PALETTES = {
    сірий: { body: '#868c95', dark: '#5b6068', sole: '#f1f1f1', accent: '#d8d8d8', ink: '#ffffff' },
    білий: { body: '#f7f7f7', dark: '#d9dadd', sole: '#ffffff', accent: '#1d3b6e', ink: '#1d3b6e' },
    бежевий: { body: '#d9c7a8', dark: '#b39f7d', sole: '#f6efe1', accent: '#8a6f45', ink: '#ffffff' },
    срібний: { body: '#c4c8ce', dark: '#8d939b', sole: '#f1f1f1', accent: '#2b2b2b', ink: '#2b2b2b' },
    сливовий: { body: '#7a5560', dark: '#4f3139', sole: '#efe6e0', accent: '#b9a3a8', ink: '#ffffff' },
    коричневий: { body: '#9a6b3f', dark: '#5f3f22', sole: '#f1ede4', accent: '#2f5b3a', ink: '#ffffff' },
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


function Cap({ p }) {
    return (
        <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" strokeLinejoin="round">
            <ellipse cx="102" cy="150" rx="70" ry="5" fill="rgba(0,0,0,0.16)" stroke="none" />
            <path d="M48 124 Q46 66 98 58 Q152 64 152 112 L152 124 Z" fill={p.body} />
            <path d="M98 58 Q84 90 88 124" fill="none" />
            <path d="M98 58 Q112 90 116 124" fill="none" />
            <circle cx="98" cy="57" r="4" fill={p.dark} />
            <path d="M128 114 Q174 110 188 126 Q160 134 128 128 Z" fill={p.dark} />
            <path d="M48 124 H152 L152 132 Q100 138 48 132 Z" fill={p.accent} />
            <text x="100" y="108" textAnchor="middle" fill={p.ink} stroke="none" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="800" fontSize="20">NB</text>
        </g>
    );
}

function Backpack({ p }) {
    return (
        <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" strokeLinejoin="round">
            <ellipse cx="100" cy="168" rx="46" ry="5" fill="rgba(0,0,0,0.16)" stroke="none" />
            <path d="M84 50 Q84 34 100 34 Q116 34 116 50" fill="none" strokeWidth="4" />
            <rect x="60" y="46" width="80" height="118" rx="28" fill={p.body} />
            <rect x="70" y="102" width="60" height="50" rx="10" fill={p.dark} />
            <path d="M70 114 H130" fill="none" stroke={p.ink} strokeOpacity="0.5" />
            <path d="M76 66 H124" fill="none" stroke={p.ink} strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" />
            <rect x="54" y="92" width="8" height="40" rx="4" fill={p.accent} />
            <rect x="138" y="92" width="8" height="40" rx="4" fill={p.accent} />
            <text x="100" y="140" textAnchor="middle" fill={p.ink} stroke="none" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="800" fontSize="16">NB</text>
        </g>
    );
}

function Tee({ p }) {
    return (
        <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" strokeLinejoin="round">
            <ellipse cx="100" cy="170" rx="52" ry="5" fill="rgba(0,0,0,0.16)" stroke="none" />
            <path d="M72 44 L100 54 L128 44 L166 66 L148 96 L134 88 L134 160 L66 160 L66 88 L52 96 L34 66 Z" fill={p.body} />
            <path d="M82 46 Q100 70 118 46" fill={p.dark} />
            <path d="M52 96 L34 66 L44 60 L60 86 Z" fill={p.dark} opacity="0.35" stroke="none" />
            <path d="M148 96 L166 66 L156 60 L140 86 Z" fill={p.dark} opacity="0.35" stroke="none" />
            <text x="100" y="108" textAnchor="middle" fill={p.ink} stroke="none" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="800" fontSize="18">NB</text>
        </g>
    );
}

function Jacket({ p }) {
    return (
        <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" strokeLinejoin="round">
            <ellipse cx="100" cy="172" rx="56" ry="5" fill="rgba(0,0,0,0.16)" stroke="none" />
            <path d="M68 52 L34 128 L52 138 L74 92 Z" fill={p.dark} />
            <path d="M132 52 L166 128 L148 138 L126 92 Z" fill={p.dark} />
            <path d="M68 52 L86 44 L100 56 L114 44 L132 52 L144 166 L56 166 Z" fill={p.body} />
            <path d="M86 44 L100 56 L114 44 L114 36 Q100 30 86 36 Z" fill={p.dark} />
            <line x1="100" y1="56" x2="100" y2="166" stroke={p.ink} strokeOpacity="0.7" strokeWidth="2" />
            <rect x="96" y="60" width="8" height="12" rx="2" fill={p.accent} />
            <path d="M72 124 H88 V146 H72 Z" fill={p.dark} opacity="0.5" />
            <path d="M112 124 H128 V146 H112 Z" fill={p.dark} opacity="0.5" />
            <text x="118" y="84" textAnchor="middle" fill={p.ink} stroke="none" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="800" fontSize="11">NB</text>
        </g>
    );
}

function Shorts({ p }) {
    return (
        <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" strokeLinejoin="round">
            <ellipse cx="100" cy="160" rx="54" ry="5" fill="rgba(0,0,0,0.16)" stroke="none" />
            <path d="M58 48 H142 L150 148 H108 L100 96 L92 148 H50 Z" fill={p.body} />
            <rect x="58" y="48" width="84" height="12" fill={p.dark} />
            <line x1="100" y1="60" x2="100" y2="96" stroke={p.ink} strokeOpacity="0.5" />
            <path d="M84 60 L82 82" stroke={p.ink} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M116 60 L118 82" stroke={p.ink} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
            <text x="124" y="124" textAnchor="middle" fill={p.ink} stroke="none" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="800" fontSize="12">NB</text>
        </g>
    );
}

function Beanie({ p }) {
    return (
        <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" strokeLinejoin="round">
            <ellipse cx="100" cy="150" rx="58" ry="5" fill="rgba(0,0,0,0.16)" stroke="none" />
            <circle cx="100" cy="46" r="11" fill={p.accent} />
            <path d="M50 118 Q50 56 100 54 Q150 56 150 118 Z" fill={p.body} />
            <path d="M70 118 Q68 70 100 56 M100 56 V118 M130 118 Q132 70 100 56" fill="none" opacity="0.5" />
            <rect x="46" y="112" width="108" height="30" rx="8" fill={p.dark} />
            <path d="M54 120 V136 M66 120 V136 M78 120 V136 M90 120 V136 M102 120 V136 M114 120 V136 M126 120 V136 M138 120 V136" stroke={p.ink} strokeOpacity="0.25" fill="none" />
            <text x="100" y="132" textAnchor="middle" fill={p.ink} stroke="none" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="800" fontSize="13">NB</text>
        </g>
    );
}

function Socks({ p }) {
    const sock = (x) => (
        <g transform={`translate(${x} 0)`}>
            <path d="M0 40 H34 V104 Q34 128 52 134 Q62 140 52 148 H8 Q-4 148 -4 134 V104 Z" fill={p.body} />
            <rect x="0" y="40" width="34" height="14" fill={p.dark} />
            <path d="M0 62 H34" stroke={p.accent} strokeWidth="4" fill="none" />
            <path d="M34 128 Q38 140 52 140" stroke={p.dark} strokeWidth="6" fill="none" opacity="0.5" />
        </g>
    );
    return (
        <g stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" strokeLinejoin="round">
            <ellipse cx="100" cy="160" rx="62" ry="5" fill="rgba(0,0,0,0.16)" stroke="none" />
            {sock(44)}
            {sock(98)}
        </g>
    );
}

function kindOf(name, categoryId) {
    const n = (name || '').toLowerCase();
    if (categoryId === 1 || /кросів|sneaker|fresh foam|numeric|new balance \d{3,4}/.test(n)) return 'sneaker';
    if (/jacket|куртк|track/.test(n)) return 'jacket';
    if (/short|шорт/.test(n)) return 'shorts';
    if (/beanie|шапк/.test(n)) return 'beanie';
    if (/sock|шкарпет/.test(n)) return 'socks';
    if (/cap|кепк|бейсбол/.test(n)) return 'cap';
    if (/backpack|рюкзак|bag/.test(n)) return 'backpack';
    if (/tee|shirt|футбол/.test(n)) return 'tee';
    return 'hoodie';
}

export default function ProductArt({ name, color, categoryId }) {
    const palette = paletteFor(color);
    const kind = kindOf(name, categoryId);
    const bgId = `pa-bg-${kind}-${(color || 'x').replace(/\W/g, '')}`;

    return (
        <svg viewBox="-33.4 0 266.8 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={name}>
            <defs>
                <radialGradient id={bgId} cx="50%" cy="40%" r="75%">
                    <stop offset="0%" stopColor="#f4f5f7" />
                    <stop offset="100%" stopColor="#c9ced6" />
                </radialGradient>
            </defs>
            <rect x="-34" width="268" height="200" fill={`url(#${bgId})`} />
            {{ sneaker: <Sneaker p={palette} />, cap: <Cap p={palette} />, backpack: <Backpack p={palette} />, tee: <Tee p={palette} />, hoodie: <Hoodie p={palette} />, jacket: <Jacket p={palette} />, shorts: <Shorts p={palette} />, beanie: <Beanie p={palette} />, socks: <Socks p={palette} /> }[kind]}
        </svg>
    );
}
