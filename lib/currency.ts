// Currency detection and conversion utilities
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.85, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.73, name: 'British Pound' },
  CAD: { symbol: 'C$', rate: 1.25, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.35, name: 'Australian Dollar' },
  JPY: { symbol: '¥', rate: 110, name: 'Japanese Yen' },
  SEK: { symbol: 'kr', rate: 9.5, name: 'Swedish Krona' },
  NOK: { symbol: 'kr', rate: 9.0, name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', rate: 6.3, name: 'Danish Krone' },
  CHF: { symbol: 'CHF', rate: 0.88, name: 'Swiss Franc' },
} as const

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES

export const BASE_PRICE_USD = 19.95
export const DERMATOLOGIST_PRICE_USD = 149.95

// Get user's currency based on their location
export async function detectUserCurrency(): Promise<SupportedCurrency> {
  try {
    // Try to get currency from browser locale first
    const browserCurrency = Intl.NumberFormat().resolvedOptions().currency as SupportedCurrency
    if (browserCurrency && SUPPORTED_CURRENCIES[browserCurrency]) {
      return browserCurrency
    }

    // Fallback: detect by location using a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    const countryCode = data.country_code

    // Map common countries to currencies
    const countryToCurrency: Record<string, SupportedCurrency> = {
      US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', JP: 'JPY',
      SE: 'SEK', NO: 'NOK', DK: 'DKK', CH: 'CHF',
      // EU countries
      DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
      BE: 'EUR', AT: 'EUR', FI: 'EUR', IE: 'EUR', PT: 'EUR',
    }

    return countryToCurrency[countryCode] || 'USD'
  } catch (error) {
    console.warn('Currency detection failed, defaulting to USD:', error)
    return 'USD'
  }
}

// Convert price to user's currency
export function convertPrice(currency: SupportedCurrency): { amount: number, cents: number, symbol: string } {
  const currencyInfo = SUPPORTED_CURRENCIES[currency]
  const convertedAmount = BASE_PRICE_USD * currencyInfo.rate
  
  // For non-US currencies, round up to whole numbers
  let amount: number
  if (currency === 'USD') {
    amount = Math.round(convertedAmount * 100) / 100
  } else if (currency === 'JPY') {
    amount = Math.ceil(convertedAmount) // JPY already has no decimals, just round up
  } else {
    amount = Math.ceil(convertedAmount) // Round up to next whole number for all other currencies
  }
  
  const cents = Math.round(amount * 100)
  
  return {
    amount,
    cents,
    symbol: currencyInfo.symbol
  }
}

// Convert dermatologist price to user's currency
export function convertDermatologistPrice(currency: SupportedCurrency): { amount: number, cents: number, symbol: string } {
  const currencyInfo = SUPPORTED_CURRENCIES[currency]
  const convertedAmount = DERMATOLOGIST_PRICE_USD * currencyInfo.rate
  
  // For non-US currencies, round up to whole numbers
  let amount: number
  if (currency === 'USD') {
    amount = Math.round(convertedAmount * 100) / 100
  } else if (currency === 'JPY') {
    amount = Math.ceil(convertedAmount) // JPY already has no decimals, just round up
  } else {
    amount = Math.ceil(convertedAmount) // Round up to next whole number for all other currencies
  }
  
  const cents = Math.round(amount * 100)
  
  return {
    amount,
    cents,
    symbol: currencyInfo.symbol
  }
}

// Format currency for display
export function formatPrice(currency: SupportedCurrency): string {
  const { amount, symbol } = convertPrice(currency)
  
  if (currency === 'USD') {
    return `${symbol}${amount.toFixed(2)}`
  } else if (currency === 'JPY') {
    return `${symbol}${amount.toLocaleString()}`
  } else {
    return `${symbol}${amount}` // No decimals for non-US currencies (already rounded up)
  }
}

// Format dermatologist price for display
export function formatDermatologistPrice(currency: SupportedCurrency): string {
  const { amount, symbol } = convertDermatologistPrice(currency)
  
  if (currency === 'USD') {
    return `${symbol}${amount.toFixed(2)}`
  } else if (currency === 'JPY') {
    return `${symbol}${amount.toLocaleString()}`
  } else {
    return `${symbol}${amount}` // No decimals for non-US currencies (already rounded up)
  }
}

// Get currency from user's location (client-side)
export function getUserCurrencyFromLocale(): SupportedCurrency {
  try {
    const locale = navigator.language || 'en-US'
    const currency = new Intl.NumberFormat(locale).resolvedOptions().currency as SupportedCurrency
    return SUPPORTED_CURRENCIES[currency] ? currency : 'USD'
  } catch {
    return 'USD'
  }
} 