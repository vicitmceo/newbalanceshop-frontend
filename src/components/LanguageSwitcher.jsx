import { useTranslation } from 'react-i18next';

const LANGS = [
    { code: 'uk', label: 'UA' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        document.documentElement.lang = code;
    };

    return (
        <select
            className="lang-switcher"
            value={i18n.language?.split('-')[0]}
            onChange={(e) => changeLanguage(e.target.value)}
        >
            {LANGS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
            ))}
        </select>
    );
}
