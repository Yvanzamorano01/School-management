
/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (e.g. 'XAF', 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'XAF') => {
    if (amount === null || amount === undefined) return '-';

    // Handle XAF/XOF specially (usually suffix without decimals)
    if (['XAF', 'XOF', 'CFA'].includes(currency)) {
        return `${amount.toLocaleString('fr-FR')} FCFA`;
    }

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        // Fallback if currency code is invalid
        return `${amount.toLocaleString()} ${currency}`;
    }
};
