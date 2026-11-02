import { Donation } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateTime } from "@/components/dashboard/overview/local-time";
import { formatMoney, fromMinorUnits } from "@/lib/money";
import type { DonationsOverview } from "@/server/handlers/donations.api";

const money = (amount: number, currency: string) =>
  formatMoney(fromMinorUnits(amount, currency), currency);

// Monthly gifts open the subscription (to see every month or cancel it);
// one-time gifts open the payment (to refund it).
function stripeUrl(d: Donation) {
  const base = `https://dashboard.stripe.com/${d.livemode ? "" : "test/"}`;
  if (d.subscriptionId) return `${base}subscriptions/${d.subscriptionId}`;
  if (d.paymentIntentId) return `${base}payments/${d.paymentIntentId}`;
  return null;
}

function StatusLine({ mode, webhookReady }: Pick<DonationsOverview, "mode" | "webhookReady">) {
  if (mode === null) {
    return (
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="warning">Stripe not connected</Badge>
        <span className="text-muted-foreground">Set STRIPE_SECRET_KEY on the server to take card donations.</span>
      </p>
    );
  }
  return (
    <div className="space-y-2 text-sm">
      <p className="flex flex-wrap items-center gap-2">
        {mode === "test" ? <Badge variant="info">Stripe test mode</Badge> : <Badge variant="success">Stripe live</Badge>}
        <span className="text-muted-foreground">
          {mode === "test"
            ? "Showing test payments only. Switch to live keys to take real donations."
            : "Card donations are on."}
        </span>
      </p>
      {!webhookReady && (
        <p className="flex flex-wrap items-center gap-2">
          <Badge variant="warning">Webhook not set up</Badge>
          <span className="text-muted-foreground">
            Monthly renewals, refunds and cancellations won&rsquo;t show here until STRIPE_WEBHOOK_SECRET is set (see DEPLOY.md).
          </span>
        </p>
      )}
    </div>
  );
}

export default function DonationsReceived({ overview }: { overview: DonationsOverview }) {
  const { mode, webhookReady, donations, totals, activeMonthly } = overview;

  return (
    <div className="space-y-4">
      <StatusLine mode={mode} webhookReady={webhookReady} />

      {totals.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {totals.map((t) => (
            <div key={t.currency} className="rounded-md border border-slate-200 px-4 py-3">
              <p className="text-2xl font-bold">{money(t.amount, t.currency)}</p>
              <p className="text-xs text-muted-foreground">
                {t.count} donation{t.count === 1 ? "" : "s"} in {t.currency}, after refunds
              </p>
            </div>
          ))}
          <div className="rounded-md border border-slate-200 px-4 py-3">
            <p className="text-2xl font-bold">{activeMonthly}</p>
            <p className="text-xs text-muted-foreground">
              active monthly donor{activeMonthly === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      )}

      {donations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No donations yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Stripe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((d) => {
              const fullyRefunded = d.refundedAmount >= d.amount;
              const url = stripeUrl(d);
              return (
                <TableRow key={d.id}>
                  <TableCell className="whitespace-nowrap">
                    <DateTime value={d.createdAt.toISOString()} />
                  </TableCell>
                  <TableCell>
                    <p>{d.name || "—"}</p>
                    {d.email && <p className="text-xs text-muted-foreground">{d.email}</p>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {d.interval === "MONTHLY" ? "Monthly" : "One-time"}
                      {d.cancelledAt && <Badge variant="outline">Stopped</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={fullyRefunded ? "text-muted-foreground line-through" : "font-medium"}>
                      {money(d.amount, d.currency)}
                    </span>
                    {d.refundedAmount > 0 && (
                      <div>
                        <Badge variant="destructive">
                          {fullyRefunded ? "Refunded" : `${money(d.refundedAmount, d.currency)} refunded`}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline"
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
        <p className="text-xs text-muted-foreground">Showing the latest 200. See all in your Stripe dashboard.</p>
      )}
    </div>
  );
}
