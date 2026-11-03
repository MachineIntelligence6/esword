import { ReactNode } from "react";
import { Donation } from "@prisma/client";
import { AlertTriangle, Clock, ExternalLink, HandCoins, HeartHandshake, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateTime, ShortDate } from "@/components/dashboard/overview/local-time";
import { formatMoney, fromMinorUnits } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { DonationsOverview } from "@/server/handlers/donations.api";

const money = (amount: number, currency: string) =>
  formatMoney(fromMinorUnits(amount, currency), currency);

const stripeBase = (live: boolean) => `https://dashboard.stripe.com/${live ? "" : "test/"}`;

// Monthly gifts open the subscription (to see every month or cancel it);
// one-time gifts open the payment (to refund it).
function stripeUrl(d: Donation) {
  const base = stripeBase(d.livemode);
  if (d.subscriptionId) return `${base}subscriptions/${d.subscriptionId}`;
  if (d.paymentIntentId) return `${base}payments/${d.paymentIntentId}`;
  return null;
}

function initials(d: Donation) {
  const source = d.name?.trim() || d.email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

const STATUS = {
  live: {
    label: "Stripe live",
    note: "Card donations are on",
    pill: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900",
    dot: "bg-emerald-500",
  },
  test: {
    label: "Stripe test mode",
    note: "Test payments only. Use live keys to take real donations.",
    pill: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900",
    dot: "bg-sky-500",
  },
  off: {
    label: "Stripe not connected",
    note: "Set STRIPE_SECRET_KEY on the server to take card donations.",
    pill: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900",
    dot: "bg-amber-500",
  },
} as const;

// Sits on the right of the page header, so it reads as page-level state.
export function StripeStatus({ mode }: Pick<DonationsOverview, "mode">) {
  const s = STATUS[mode ?? "off"];
  return (
    // Pill first so it leads on phones; reversed on wider screens so it ends flush right.
    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm sm:flex-row-reverse">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
          s.pill,
        )}
      >
        <span className="relative flex h-2 w-2" aria-hidden>
          {mode === "live" && (
            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping", s.dot)} />
          )}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.dot)} />
        </span>
        {s.label}
      </span>
      <span className="text-slate-500">{s.note}</span>
    </p>
  );
}

function WebhookWarning() {
  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/40"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
      <p className="text-slate-700">
        <span className="font-semibold text-amber-800 dark:text-amber-300">Webhook not set up.</span>{" "}
        Monthly renewals, refunds and cancellations won&rsquo;t show here until STRIPE_WEBHOOK_SECRET is set (see DEPLOY.md).
      </p>
    </div>
  );
}

function Stat({ label, icon, value, meta }: { label: string; icon: ReactNode; value: ReactNode; meta: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-sm border border-slate-200 bg-white px-4 py-3.5">
      <div className="flex items-center justify-between gap-2 text-slate-400">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-bold tabular-nums leading-tight text-slate-900">{value}</span>
      <span className="truncate text-sm text-slate-500">{meta}</span>
    </div>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function DonationsReceived({ overview }: { overview: DonationsOverview }) {
  const { mode, webhookReady, donations, totals, activeMonthly } = overview;
  const latest = donations[0];
  const iconClass = "h-4 w-4";

  return (
    <div className="space-y-5">
      {mode !== null && !webhookReady && <WebhookWarning />}

      {totals.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {totals.map((t) => (
            <Stat
              key={t.currency}
              label={totals.length > 1 ? `Raised in ${t.currency}` : "Total raised"}
              icon={<HandCoins className={iconClass} aria-hidden />}
              value={money(t.amount, t.currency)}
              meta={`${plural(t.count, "donation")} in ${t.currency}, after refunds`}
            />
          ))}
          <Stat
            label="Monthly donors"
            icon={<Repeat className={iconClass} aria-hidden />}
            value={activeMonthly}
            meta={activeMonthly === 1 ? "Active subscription" : "Active subscriptions"}
          />
          {latest && (
            <Stat
              label="Latest donation"
              icon={<Clock className={iconClass} aria-hidden />}
              value={<span className="capitalize"><ShortDate value={latest.createdAt.toISOString()} /></span>}
              meta={`${money(latest.amount, latest.currency)} from ${latest.name || latest.email || "an anonymous donor"}`}
            />
          )}
        </div>
      )}

      <section className="overflow-hidden rounded-sm border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">
            Donation history
            {donations.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">{plural(donations.length, "donation")}</span>
            )}
          </h2>
          {mode !== null && (
            <a
              href={`${stripeBase(mode === "live")}payments`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline dark:text-[#d97757]"
            >
              Open Stripe
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>

        {donations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-400">
              <HeartHandshake className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-medium text-slate-900">No donations yet</p>
            <p className="text-sm text-slate-500">Gifts made on the donation page will show up here.</p>
          </div>
        ) : (
          <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="h-10 text-xs">Date</TableHead>
                <TableHead className="h-10 text-xs">Donor</TableHead>
                <TableHead className="h-10 text-xs">Type</TableHead>
                <TableHead className="h-10 text-right text-xs">Amount</TableHead>
                <TableHead className="h-10 text-xs">
                  <span className="sr-only">Stripe</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((d) => {
                const fullyRefunded = d.refundedAmount >= d.amount;
                const url = stripeUrl(d);
                return (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap text-slate-600">
                      <DateTime value={d.createdAt.toISOString()} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-25 text-xs font-semibold text-primary-700 dark:text-sky-300"
                          aria-hidden
                        >
                          {initials(d)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{d.name || "Anonymous"}</p>
                          {d.email && <p className="truncate text-xs text-slate-500">{d.email}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {d.interval === "MONTHLY" ? (
                          <Badge variant="info" className="gap-1 text-primary-700 dark:bg-sky-950/50 dark:text-sky-300">
                            <Repeat className="h-3 w-3" aria-hidden />
                            Monthly
                          </Badge>
                        ) : (
                          <Badge>One-time</Badge>
                        )}
                        {d.cancelledAt && <Badge variant="outline">Stopped</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <span
                        className={cn(
                          "tabular-nums",
                          fullyRefunded ? "text-slate-500 line-through" : "font-semibold text-slate-900",
                        )}
                      >
                        {money(d.amount, d.currency)}
                      </span>
                      {d.refundedAmount > 0 && (
                        <div className="mt-1">
                          <Badge variant="destructive">
                            {fullyRefunded ? "Refunded" : `${money(d.refundedAmount, d.currency)} refunded`}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="w-px whitespace-nowrap text-right">
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline dark:text-[#d97757]"
                        >
                          View
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          <span className="sr-only">in Stripe (opens in a new tab)</span>
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {donations.length === 200 && (
          <p className="border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500">
            Showing the latest 200. See all in your Stripe dashboard.
          </p>
        )}
      </section>
    </div>
  );
}
