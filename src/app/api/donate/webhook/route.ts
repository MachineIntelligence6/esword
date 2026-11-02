import serverApiHandlers from "@/server/handlers"

// Stripe calls this directly (no session), so /api/donate is public in proxy.ts.
// The handler checks Stripe's signature against STRIPE_WEBHOOK_SECRET instead.
export async function POST(req: Request) {
    return serverApiHandlers.donations.handleStripeWebhook(req)
}
