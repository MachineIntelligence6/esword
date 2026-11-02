// Stripe takes amounts in the currency's smallest unit: cents for USD,
// whole yen for JPY. Intl knows how many decimals each currency uses.
function currencyDecimals(currency: string) {
    try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2
    } catch {
        return 2
    }
}

export function toMinorUnits(amount: number, currency: string) {
    return Math.round(amount * 10 ** currencyDecimals(currency))
}

export function fromMinorUnits(amount: number, currency: string) {
    return amount / 10 ** currencyDecimals(currency)
}

export function formatMoney(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: Number.isInteger(amount) ? 0 : undefined,
        }).format(amount)
    } catch {
        return `${amount} ${currency}`
    }
}

// "10, 25,50" -> [10, 25, 50]; drops anything that isn't a positive number.
export function parsePresetAmounts(value: string) {
    return value
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
}

// Currencies offered in the dashboard. Stripe accepts all of these for card payments.
export const DONATION_CURRENCIES = [
    "USD", "EUR", "GBP", "CAD", "AUD", "NZD", "CHF", "SEK", "NOK", "DKK",
    "JPY", "SGD", "HKD", "INR", "PKR", "AED", "SAR", "ZAR", "MXN", "BRL",
]
