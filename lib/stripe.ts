import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Server-side Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Base price in GBP - actual price conversion happens in currency.ts
export const ASSESSMENT_PRICE_GBP = 6.00
export const ASSESSMENT_PRICE_CENTS_GBP = Math.round(ASSESSMENT_PRICE_GBP * 100) 