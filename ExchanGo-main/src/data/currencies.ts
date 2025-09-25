export interface Currency {
    code: string;
    name: string;
    flag: string;
    symbol: string;
}

export const currencies: Currency[] = [
    {
        code: 'AED',
        name: 'Emirati Dirham',
        flag: 'https://flagcdn.com/ae.svg',
        symbol: 'د.إ'
    },
    {
        code: 'CAD',
        name: 'Canadian Dollar',
        flag: 'https://flagcdn.com/ca.svg',
        symbol: 'C$'
    },
    {
        code: 'CHF',
        name: 'Swiss Franc',
        flag: 'https://flagcdn.com/ch.svg',
        symbol: 'CHF'
    },
    {
        code: 'DKK',
        name: 'Danish Krone',
        flag: 'https://flagcdn.com/dk.svg',
        symbol: 'kr'
    },
    {
        code: 'EUR',
        name: 'Euro',
        flag: 'https://flagcdn.com/eu.svg',
        symbol: '€'
    },
    {
        code: 'KWD',
        name: 'Kuwaiti Dinar',
        flag: 'https://flagcdn.com/kw.svg',
        symbol: 'KD'
    },
    {
        code: 'MAD',
        name: 'Moroccan Dirham',
        flag: 'https://flagcdn.com/ma.svg',
        symbol: 'DH'
    },
    {
        code: 'NOK',
        name: 'Norwegian Krone',
        flag: 'https://flagcdn.com/no.svg',
        symbol: 'kr'
    },
    {
        code: 'OMR',
        name: 'Omani Rial',
        flag: 'https://flagcdn.com/om.svg',
        symbol: '﷼'
    },
    {
        code: 'QAR',
        name: 'Qatari Riyal',
        flag: 'https://flagcdn.com/qa.svg',
        symbol: 'ر.ق'
    },
    {
        code: 'SAR',
        name: 'Saudi Riyal',
        flag: 'https://flagcdn.com/sa.svg',
        symbol:'﷼',
    },
    {
        code: 'SEK',
        name: 'Swedish Krona',
        flag: 'https://flagcdn.com/se.svg',
        symbol: 'kr'
    },
    {
        code: 'USD',
        name: 'US Dollar',
        flag: 'https://flagcdn.com/us.svg',
        symbol: '$'
    },
];
