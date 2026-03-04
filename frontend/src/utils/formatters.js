import { format } from 'date-fns';

/**
 * Returns the correct symbol for a given currency code.
 */
export const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
        case 'USD': return '$';
        case 'GBP': return '£';
        case 'CHF': return 'CHF';
        case 'EUR':
        default: return '€';
    }
};

/**
 * Formats an amount with the provided currency symbol.
 */
export const formatCurrency = (amount, currencyCode = 'EUR') => {
    const number = parseFloat(amount) || 0;
    const symbol = getCurrencySymbol(currencyCode);

    // Format decimal using German locale visually, but you could expand this locally too
    const formattedNumber = number.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (currencyCode === 'USD' || currencyCode === 'GBP') {
        return `${symbol}${formattedNumber}`;
    }

    return `${formattedNumber} ${symbol}`;
};

/**
 * Formats a Date object or string based on user's selected format
 */
export const formatDate = (dateInput, dateFormat = 'dd.MM.yyyy') => {
    if (!dateInput) return '-';
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '-';

        switch (dateFormat) {
            case 'MM/dd/yyyy':
                return format(d, 'MM/dd/yyyy');
            case 'yyyy-MM-dd':
                return format(d, 'yyyy-MM-dd');
            case 'dd.MM.yyyy':
            default:
                return format(d, 'dd.MM.yyyy');
        }
    } catch (error) {
        return String(dateInput);
    }
};

/**
 * Formats a time from a Date object/string based on user preference
 */
export const formatTime = (dateInput, timeFormat = '24h') => {
    if (!dateInput) return '-';
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '-';

        switch (timeFormat) {
            case '12h':
                return format(d, 'hh:mm:ss a');
            case '24h':
            default:
                return format(d, 'HH:mm:ss');
        }
    } catch (error) {
        return '-';
    }
};

/**
 * Formats a full Date and Time string smoothly
 */
export const formatDateTime = (dateInput, dateFormat = 'dd.MM.yyyy', timeFormat = '24h') => {
    const dateStr = formatDate(dateInput, dateFormat);
    const timeStr = formatTime(dateInput, timeFormat);
    if (dateStr === '-') return '-';
    return `${dateStr} ${timeStr}`;
};

/**
 * Transforms a decimal hours amount (e.g. 2.5) into HH:mm:ss format
 */
export const formatDuration = (hoursFloat) => {
    if (!hoursFloat || isNaN(hoursFloat)) return '00:00:00';
    const totalSeconds = Math.round(hoursFloat * 3600);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Transforms an 'HH:mm:ss' or 'HH:mm' string back into decimal hours for the database
 */
export const parseDurationToHours = (durationString) => {
    if (!durationString) return 0;
    const parts = durationString.split(':');
    if (parts.length === 3) {
        const hrs = parseInt(parts[0], 10) || 0;
        const mins = parseInt(parts[1], 10) || 0;
        const secs = parseInt(parts[2], 10) || 0;
        return hrs + (mins / 60) + (secs / 3600);
    } else if (parts.length === 2) {
        const hrs = parseInt(parts[0], 10) || 0;
        const mins = parseInt(parts[1], 10) || 0;
        return hrs + (mins / 60);
    }
    return parseFloat(durationString) || 0;
};
