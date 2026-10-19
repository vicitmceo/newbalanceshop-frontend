import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Коди країн (ISO 3166-1 alpha-2): назви беруться з браузера мовою інтерфейсу.
const CODES = [
    'UA', 'PL', 'DE', 'FR', 'GB', 'US', 'CA', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT', 'CZ', 'SK', 'HU', 'RO', 'BG', 'MD', 'LT', 'LV', 'EE',
    'FI', 'SE', 'NO', 'DK', 'IE', 'IS', 'GR', 'HR', 'SI', 'RS', 'BA', 'ME', 'MK', 'AL', 'XK', 'GE', 'AM', 'AZ', 'TR', 'KZ', 'UZ', 'IL', 'AE',
    'SA', 'EG', 'MA', 'TN', 'ZA', 'IN', 'CN', 'JP', 'KR', 'SG', 'AU', 'NZ', 'BR', 'AR', 'MX', 'CL', 'CO',
];

// Зберігаємо назву країни мовою інтерфейсу (так її бачить і адміністратор); список побудований з кодів.
export default function CountrySelect({ value, onChange, className = 'input', ...rest }) {
    const { t, i18n } = useTranslation();
    const options = useMemo(() => {
        let names;
        try {
            names = new Intl.DisplayNames([i18n.language], { type: 'region' });
        } catch {
            names = null;
        }
        const list = CODES.map((code) => (names ? names.of(code) : code)).filter(Boolean);
        return [...new Set(list)].sort((a, b) => a.localeCompare(b, i18n.language));
    }, [i18n.language]);

    // значення, якого немає в списку (наприклад, введене раніше вручну), теж показуємо
    const extra = value && !options.includes(value) ? [value] : [];

    return (
        <select className={className} value={value} onChange={onChange} {...rest}>
            <option value="">{t('auth.selectCountry')}</option>
            {[...extra, ...options].map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
    );
}
