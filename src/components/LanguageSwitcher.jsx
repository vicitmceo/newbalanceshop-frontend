import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
    { code: 'uk', label: 'UA', name: 'Українська' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'fr', label: 'FR', name: 'Français' },
];

// Власне випадаюче меню замість рідного <select>: однакове в усіх браузерах
export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const current = LANGS.find((l) => l.code === i18n.language?.split('-')[0]) || LANGS[0];

    useEffect(() => {
        const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
    }, []);

    const choose = (code) => {
        i18n.changeLanguage(code);
        document.documentElement.lang = code;
        setOpen(false);
    };

    return (
        <div className="lang" ref={ref}>
            <button type="button" className="lang-btn" onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open}>
                {current.label}
                <svg className={`lang-caret ${open ? 'open' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 1l4 4 4-4" /></svg>
            </button>
            {open && (
                <ul className="lang-menu" role="listbox">
                    {LANGS.map((l) => (
                        <li key={l.code} role="option" aria-selected={l.code === current.code}>
                            <button type="button" className={`lang-item ${l.code === current.code ? 'on' : ''}`} onClick={() => choose(l.code)}>
                                <span className="lang-code">{l.label}</span>
                                <span className="lang-name">{l.name}</span>
                                {l.code === current.code && <span className="lang-check">✓</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
