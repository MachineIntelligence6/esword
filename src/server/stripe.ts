import Stripe from "stripe"

// Created on first use so `next build` works without the key set.
let client: Stripe | null = null

export function getStripe(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return null
    if (!client) client = new Stripe(key)
    return client
}

// "test" for sk_test_/rk_test_ keys, "live" for live keys, null when unset.
export function stripeMode(): "test" | "live" | null {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return null
    return /^(sk|rk)_test_/.test(key) ? "test" : "live"
}

// Public origin used for Stripe's return links; never taken from request headers.
export function siteOrigin() {
    return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/+$/, "")
}
