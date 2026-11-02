import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Donation, Prisma } from "@prisma/client";
import db from "@/server/db";
import { ApiResponse } from "@/shared/types/api.types";
import { getStripe, siteOrigin, stripeMode } from "@/server/stripe";
import { toMinorUnits } from "@/lib/money";
import { isAuthError, requireAdmin } from "./authz";
import { getDonationSettings } from "./settings.api";

// Tags our Checkout sessions and subscriptions so the webhook ignores any
// other payments on the same Stripe account.
const DONATION_SOURCE = "donate-page"
const MIN_AMOUNT = 1
const MAX_AMOUNT = 100000

// Public endpoint: cap how many checkouts one visitor can start, which also
// slows down anyone using the form to test stolen cards.
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000
const MAX_CHECKOUTS_PER_WINDOW = 10
const checkoutAttempts = new Map<string, { count: number, resetAt: number }>()

function isCheckoutRateLimited(ip: string) {
    const now = Date.now()
    if (checkoutAttempts.size > 5000) {
        checkoutAttempts.forEach((v, k) => { if (now > v.resetAt) checkoutAttempts.delete(k) })
    }
    const current = checkoutAttempts.get(ip)
    if (!current || now > current.resetAt) {
        checkoutAttempts.set(ip, { count: 1, resetAt: now + CHECKOUT_WINDOW_MS })
        return false
    }
    current.count++
    return current.count > MAX_CHECKOUTS_PER_WINDOW
}

// nginx appends the real client address, so the last entry is the trusted one.
function clientIp(req: Request) {
    return req.headers.get("x-forwarded-for")?.split(",").pop()?.trim()
        || req.headers.get("x-real-ip")
        || "unknown"
}



export async function createCheckout(req: Request): Promise<ApiResponse<{ url: string }>> {
    try {
        const stripe = getStripe()
        if (!stripe) return { succeed: false, code: "UNKNOWN_ERROR", data: null }
        if (isCheckoutRateLimited(clientIp(req))) return { succeed: false, code: "RATE_LIMITED", data: null }
        const b = await req.json() as { amount?: unknown, monthly?: unknown }
        const amount = Number(b.amount)
        if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
            return { succeed: false, code: "VALIDATION_ERROR", data: null }
        }
        const { data: s } = await getDonationSettings()
        if (!s) throw new Error("Donation settings unavailable")
        const monthly = b.monthly === true && s.monthlyOption
        const label = monthly ? "Monthly donation" : "Donation"
        const origin = siteOrigin()
        const metadata = { source: DONATION_SOURCE }
        const session = await stripe.checkout.sessions.create({
            mode: monthly ? "subscription" : "payment",
            line_items: [{
                quantity: 1,
                price_data: {
                    currency: s.currency.toLowerCase(),
                    unit_amount: toMinorUnits(amount, s.currency),
                    product_data: { name: s.orgName ? `${label} to ${s.orgName}` : label },
                    recurring: monthly ? { interval: "month" } : undefined,
                },
            }],
            submit_type: monthly ? undefined : "donate",
            metadata,
            subscription_data: monthly ? { metadata } : undefined,
            success_url: `${origin}/donate/thanks?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/donate`,
        })
        if (!session.url) throw new Error("Stripe returned no checkout URL")
        return { succeed: true, code: "SUCCESS", data: { url: session.url } }
    } catch (error) {
        console.error(error)
        return { succeed: false, code: "UNKNOWN_ERROR", data: null }
    }
}



const idOf = (v: string | { id: string } | null) => (typeof v === "string" ? v : v?.id ?? null)

// The thank-you page and the webhook both report the same payment; whichever
// arrives second finds the row already there.
async function saveDonation(data: Prisma.DonationCreateInput) {
    try {
        await db.donation.upsert({ where: { stripeId: data.stripeId }, create: data, update: {} })
    } catch (error) {
        const duplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
        if (!duplicate) throw error
    }
}

async function recordCheckoutSession(session: Stripe.Checkout.Session) {
    if (session.payment_status !== "paid" || session.amount_total == null || !session.currency) return
    await saveDonation({
        stripeId: session.id,
        interval: session.mode === "subscription" ? "MONTHLY" : "ONE_TIME",
        amount: session.amount_total,
        currency: session.currency.toUpperCase(),
        email: session.customer_details?.email ?? null,
        name: session.customer_details?.name ?? null,
        subscriptionId: idOf(session.subscription),
        paymentIntentId: idOf(session.payment_intent),
        invoiceId: idOf(session.invoice),
        livemode: session.livemode,
    })
}

async function recordRenewal(invoice: Stripe.Invoice) {
    // The first month is already recorded from its Checkout session.
    if (invoice.billing_reason !== "subscription_cycle" || invoice.amount_paid <= 0) return
    await saveDonation({
        stripeId: invoice.id,
        interval: "MONTHLY",
        amount: invoice.amount_paid,
        currency: invoice.currency.toUpperCase(),
        email: invoice.customer_email,
        name: invoice.customer_name,
        subscriptionId: idOf(invoice.parent?.subscription_details?.subscription ?? null),
        invoiceId: invoice.id,
        livemode: invoice.livemode,
        // Stripe retries webhooks for days if the site is down; date it when it was paid.
        createdAt: new Date((invoice.status_transitions.paid_at ?? invoice.created) * 1000),
    })
}

async function recordRefund(charge: Stripe.Charge) {
    const paymentIntentId = idOf(charge.payment_intent)
    if (!paymentIntentId) return
    const data = { refundedAmount: charge.amount_refunded }
    const { count } = await db.donation.updateMany({ where: { paymentIntentId }, data })
    if (count > 0) return
    // A monthly payment is linked to its invoice, not to the payment itself.
    const stripe = getStripe()
    if (!stripe) return
    try {
        const { data: payments } = await stripe.invoicePayments.list({
            payment: { type: "payment_intent", payment_intent: paymentIntentId },
            limit: 1,
        })
        const invoiceId = idOf(payments[0]?.invoice ?? null)
        if (invoiceId) await db.donation.updateMany({ where: { invoiceId }, data: { ...data, paymentIntentId } })
    } catch (error) {
        // Most likely the key lacks "Invoices: Read". Retrying wouldn't help, so don't fail the webhook.
        console.error("Could not match refund to a monthly donation", error)
    }
}

async function recordCancellation(subscription: Stripe.Subscription) {
    const endedAt = subscription.ended_at ?? subscription.canceled_at
    await db.donation.updateMany({
        where: { subscriptionId: subscription.id, cancelledAt: null },
        data: { cancelledAt: endedAt ? new Date(endedAt * 1000) : new Date() },
    })
}



export type DonationReceipt = { amount: number, currency: string, monthly: boolean, paid: boolean }

export async function confirmCheckout(sessionId: string): Promise<ApiResponse<DonationReceipt>> {
    try {
        const stripe = getStripe()
        if (!stripe || !/^cs_\w+$/.test(sessionId)) return { succeed: false, code: "NOT_FOUND", data: null }
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        if (session.metadata?.source !== DONATION_SOURCE || session.status !== "complete") {
            return { succeed: false, code: "NOT_FOUND", data: null }
        }
        await recordCheckoutSession(session)
        return {
            succeed: true,
            data: {
                amount: session.amount_total ?? 0,
                currency: (session.currency ?? "usd").toUpperCase(),
                monthly: session.mode === "subscription",
                paid: session.payment_status === "paid",
            },
        }
    } catch (error) {
        console.error(error)
        return { succeed: false, code: "UNKNOWN_ERROR", data: null }
    }
}



// Events the Stripe webhook endpoint must send; DEPLOY.md lists the same ones.
export const WEBHOOK_EVENTS = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "invoice.paid",
    "charge.refunded",
    "customer.subscription.deleted",
] as const

// Stripe retries any event that doesn't get a 2xx, so only answer 200 once it's saved.
export async function handleStripeWebhook(req: Request): Promise<Response> {
    const stripe = getStripe()
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!stripe || !secret) return new Response("Stripe is not configured", { status: 500 })
    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret)
    } catch {
        return new Response("Invalid signature", { status: 400 })
    }
    try {
        // Stripe formats a webhook in the endpoint's API version, which can be
        // years older than the one this code reads (this account's default is 2015).
        // Fetching the event again returns it in the SDK's version.
        if (event.api_version !== Stripe.API_VERSION && (WEBHOOK_EVENTS as readonly string[]).includes(event.type)) {
            event = await stripe.events.retrieve(event.id)
        }
        switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
                if (event.data.object.metadata?.source === DONATION_SOURCE) await recordCheckoutSession(event.data.object)
                break
            case "invoice.paid":
                if (event.data.object.parent?.subscription_details?.metadata?.source === DONATION_SOURCE) await recordRenewal(event.data.object)
                break
            case "charge.refunded":
                // Only matches charges that belong to a recorded donation.
                await recordRefund(event.data.object)
                break
            case "customer.subscription.deleted":
                if (event.data.object.metadata?.source === DONATION_SOURCE) await recordCancellation(event.data.object)
                break
        }
        return NextResponse.json({ received: true })
    } catch (error) {
        console.error(error)
        return new Response("Webhook handler failed", { status: 500 })
    }
}



export type DonationTotal = { currency: string, amount: number, count: number }
export type DonationSummary = {
    mode: "test" | "live" | null
    webhookReady: boolean
    totals: DonationTotal[] // after refunds, one per currency
    activeMonthly: number
}

// Keep test payments out of the real totals: count whichever mode the key is in.
const modeFilter = () => ({ livemode: stripeMode() !== "test" })

async function summarize(): Promise<DonationSummary> {
    const where = modeFilter()
    const [groups, monthly] = await Promise.all([
        db.donation.groupBy({ by: ["currency"], where, _sum: { amount: true, refundedAmount: true }, _count: { _all: true } }),
        db.donation.groupBy({ by: ["subscriptionId"], where: { ...where, interval: "MONTHLY", cancelledAt: null, subscriptionId: { not: null } } }),
    ])
    const totals = groups.map((g) => ({
        currency: g.currency,
        amount: (g._sum.amount ?? 0) - (g._sum.refundedAmount ?? 0),
        count: g._count._all,
    }))
    return {
        mode: stripeMode(),
        webhookReady: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        totals,
        activeMonthly: monthly.length,
    }
}

export async function getDonationSummary(): Promise<ApiResponse<DonationSummary>> {
    try {
        const session = await requireAdmin()
        if (isAuthError(session)) return session
        return { succeed: true, data: await summarize() }
    } catch (error) {
        console.error(error)
        return { succeed: false, code: "UNKNOWN_ERROR", data: null }
    }
}

export type DonationsOverview = DonationSummary & { donations: Donation[] }

export async function getDonations(): Promise<ApiResponse<DonationsOverview>> {
    try {
        const session = await requireAdmin()
        if (isAuthError(session)) return session
        const [summary, donations] = await Promise.all([
            summarize(),
            db.donation.findMany({ where: modeFilter(), orderBy: { createdAt: "desc" }, take: 200 }),
        ])
        return { succeed: true, data: { ...summary, donations } }
    } catch (error) {
        console.error(error)
        return { succeed: false, code: "UNKNOWN_ERROR", data: null }
    }
}
