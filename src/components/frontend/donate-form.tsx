"use client";

import { useState } from "react";
import clientApiHandlers from "@/client/handlers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";

type Props = {
  currency: string;
  presets: number[];
  initialAmount: number;
  monthlyOption: boolean;
  cardEnabled: boolean;
  cardButtonLabel: string;
  paypalUrl: string;
  paypalButtonLabel: string;
};

function currencySymbol(currency: string) {
  try {
    return (
      new Intl.NumberFormat("en-US", { style: "currency", currency })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? currency
    );
  } catch {
    return currency;
  }
}

export default function DonateForm({
  currency,
  presets,
  initialAmount,
  monthlyOption,
  cardEnabled,
  cardButtonLabel,
  paypalUrl,
  paypalButtonLabel,
}: Props) {
  const [selected, setSelected] = useState<number | null>(initialAmount > 0 ? initialAmount : null);
  const [custom, setCustom] = useState("");
  const [monthly, setMonthly] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const amount = custom !== "" ? Number(custom) : selected ?? 0;
  const valid = Number.isFinite(amount) && amount >= 1 && amount <= 100000;
  const display = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valid ? amount : 0);

  const donate = async () => {
    if (!valid) {
      setError("Please enter an amount of at least 1.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await clientApiHandlers.donations.createCheckout({ amount, monthly });
    if (res.succeed && res.data?.url) {
      // Stripe's hosted checkout page; keep the button disabled while it loads.
      window.location.assign(res.data.url);
      return;
    }
    setSubmitting(false);
    setError(
      res.code === "RATE_LIMITED"
        ? "Too many attempts. Please wait a few minutes and try again."
        : res.code === "VALIDATION_ERROR"
          ? "Please enter a valid amount."
          : "Could not start the payment. Please try again."
    );
  };

  return (
    <div className="flex w-full flex-col items-center">
      {cardEnabled && (
        <>
          <p className="pt-6 text-6xl font-bold text-primary-dark">
            <span className="align-top text-2xl">{currencySymbol(currency)}</span>
            {display}
            {monthly && <span className="text-xl font-semibold">/month</span>}
          </p>
          <p className="py-2 text-base font-bold text-primary-dark">{currency}</p>

          {presets.length > 0 && (
            <div
              className={cn(
                "grid w-full gap-2 pt-4",
                presets.length === 4 ? "grid-cols-4" : "grid-cols-3"
              )}
            >
              {presets.map((p) => {
                const active = custom === "" && selected === p;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSelected(p);
                      setCustom("");
                      setError("");
                    }}
                    className={cn(
                      "h-11 rounded-md border text-base font-semibold transition-colors",
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300 bg-white text-primary-dark hover:border-primary"
                    )}
                  >
                    {formatMoney(p, currency)}
                  </button>
                );
              })}
            </div>
          )}
          <label className="w-full pt-3 text-left text-sm text-primary-dark">
            <span className="sr-only">Other amount</span>
            <Input
              type="number"
              inputMode="decimal"
              min={1}
              max={100000}
              step="any"
              placeholder="Other amount"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setError("");
              }}
              className="h-11 text-base"
            />
          </label>

          {monthlyOption && (
            <div className="flex items-center gap-x-2 pt-5">
              <Checkbox
                id="donate-monthly"
                checked={monthly}
                onCheckedChange={(v) => setMonthly(v === true)}
              />
              <label htmlFor="donate-monthly">Make this a monthly donation</label>
            </div>
          )}

          <div className="w-full pt-6">
            <Button
              type="button"
              variant="primary"
              className="h-12 w-full"
              onClick={donate}
              disabled={submitting}
            >
              {submitting ? "Opening secure checkout…" : cardButtonLabel}
            </Button>
            {error && (
              <p role="alert" className="pt-2 text-sm text-danger">
                {error}
              </p>
            )}
            <p className="pt-2 text-xs text-muted-foreground">
              You will finish on Stripe&rsquo;s secure checkout page.
            </p>
          </div>
        </>
      )}

      {paypalUrl ? (
        <div className={cn("w-full", cardEnabled ? "pt-4" : "pt-8")}>
          {cardEnabled && <p className="pb-3 text-xs uppercase text-muted-foreground">or</p>}
          <Button variant={cardEnabled ? "outline" : "primary"} className="h-12 w-full" asChild>
            <a href={paypalUrl} target="_blank" rel="noopener noreferrer">
              {paypalButtonLabel}
            </a>
          </Button>
        </div>
      ) : (
        !cardEnabled && (
          <div className="w-full pt-8">
            <Button variant="primary" className="h-12 w-full" disabled>
              {cardButtonLabel}
            </Button>
          </div>
        )
      )}
    </div>
  );
}
