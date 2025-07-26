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
export const DERMATOLOGIST_PRICE_GBP = 110.00

// Simplified currency detection - avoiding CORS issues and making it consistent
export const detectUserCurrency = async (): Promise<SupportedCurrency> => {
  try {
    // Check if we already detected currency in this session
    if (typeof window !== 'undefined') {
      const storedCurrency = sessionStorage.getItem('detectedCurrency') as SupportedCurrency
      if (storedCurrency && SUPPORTED_CURRENCIES[storedCurrency]) {
        console.log('Using stored currency:', storedCurrency)
        return storedCurrency
      }
    }

    // Use browser locale for currency detection (only once per session)
    const locale = navigator.language || 'en-US'
    let detectedCurrency: SupportedCurrency = 'USD' // Default
    
    if (locale.includes('gb') || locale.includes('uk')) {
      detectedCurrency = 'GBP'
    } else if (locale.includes('au')) {
      detectedCurrency = 'AUD'
    } else if (locale.includes('ca')) {
      detectedCurrency = 'CAD'
    } else if (locale.includes('eu') || locale.includes('de') || locale.includes('fr') || locale.includes('es') || locale.includes('it')) {
      detectedCurrency = 'EUR'
    } else if (locale.includes('jp')) {
      detectedCurrency = 'JPY'
    }
    
    // Store the detected currency for the session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('detectedCurrency', detectedCurrency)
      console.log('Detected and stored currency:', detectedCurrency, 'from locale:', locale)
    }
    
    return detectedCurrency
  } catch (error) {
    console.warn('Currency detection failed:', error)
    // If anything fails, return USD and store it
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('detectedCurrency', 'USD')
    }
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

// Convert dermatologist price to user's currency (base price is £110 GBP)
export function convertDermatologistPrice(currency: SupportedCurrency): { amount: number, cents: number, symbol: string } {
  const currencyInfo = SUPPORTED_CURRENCIES[currency]
  const gbpRate = SUPPORTED_CURRENCIES['GBP'].rate
  
  // Convert from GBP base price to the target currency
  let convertedAmount: number
  if (currency === 'GBP') {
    convertedAmount = DERMATOLOGIST_PRICE_GBP
  } else {
    // Convert GBP to USD first, then to target currency
    const usdAmount = DERMATOLOGIST_PRICE_GBP / gbpRate
    convertedAmount = usdAmount * currencyInfo.rate
  }
  
  // For non-US currencies, round up to whole numbers
  let amount: number
  if (currency === 'USD') {
    amount = Math.round(convertedAmount * 100) / 100
  } else if (currency === 'JPY') {
    amount = Math.ceil(convertedAmount) // JPY already has no decimals, just round up
  } else if (currency === 'GBP') {
    amount = DERMATOLOGIST_PRICE_GBP // Keep original GBP price
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