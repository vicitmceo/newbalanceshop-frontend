import { useTranslation } from 'react-i18next';

// Форматує суму у гривнях за мовою інтерфейсу.
export function useMoney() {
    const { i18n } = useTranslation();
    return (value) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(value);
}
