"use client";

import { useState } from "react";
import { DonationSettings } from "@prisma/client";
import clientApiHandlers from "@/client/handlers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { DONATION_CURRENCIES } from "@/lib/money";

type Props = { settings: DonationSettings };
type Key = keyof DonationSettings;

// Ties each label to its input, so clicking the label focuses the field
// and screen readers announce it.
const fieldId = (k: Key) => `donation-${k}`;
const isHttpsOrEmpty = (u: string) => u === "" || /^https:\/\//i.test(u);

function currencyName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

// Checked before saving so the message names the field that's wrong.
function problem(v: DonationSettings) {
  if (!DONATION_CURRENCIES.includes(v.currency)) return "Choose a currency from the list.";
  if (!isHttpsOrEmpty(v.paypalUrl)) return "PayPal link must start with https://";
  if (!isHttpsOrEmpty(v.manageUrl)) return "Manage donation link must start with https://";
  return null;
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function DonationSettingsForm({ settings }: Props) {
  const [v, setV] = useState<DonationSettings>(settings);
  const [saved, setSaved] = useState<DonationSettings>(settings);
  // What's typed in number boxes, so a box can be cleared without snapping to 0.
  const [drafts, setDrafts] = useState<Partial<Record<Key, string>>>({});
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);

  const set = <K extends Key>(k: K, val: DonationSettings[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));
  const text = (k: Key) => ({
    id: fieldId(k),
    value: String(v[k] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(k, e.target.value as never),
  });
  const numeric = (k: Key) => ({
    id: fieldId(k),
    type: "number" as const,
    min: 0,
    value: drafts[k] ?? String(v[k]),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDrafts((d) => ({ ...d, [k]: raw }));
      set(k, (raw === "" ? 0 : Number(raw)) as never);
    },
  });

  const save = async () => {
    const message = problem(v);
    if (message) {
      toast({ title: "Could not save", variant: "destructive", description: message });
      return;
    }
    setSaving(true);
    const { id, ...payload } = v;
    const res = await clientApiHandlers.settings.saveDonationSettings(payload);
    setSaving(false);
    if (res.succeed && res.data) {
      setV(res.data);
      setSaved(res.data);
      setDrafts({});
      toast({ title: "Saved", description: "Donation settings updated." });
    } else {
      toast({
        title: "Could not save",
        variant: "destructive",
        description:
          res.code === "VALIDATION_ERROR"
            ? "Check the currency and that both links start with https://"
            : "Some error occured while processing your request, please try again.",
      });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <h2 className="text-lg font-bold">Donate page</h2>
        <Field label="Page title (top bar)" htmlFor={fieldId("pageTitle")}>
          <Input {...text("pageTitle")} />
        </Field>
        <Field label="Heading" htmlFor={fieldId("heading")}>
          <Input {...text("heading")} />
        </Field>
        <Field label="Organization name" htmlFor={fieldId("orgName")}>
          <Input {...text("orgName")} />
        </Field>
        <Field label="Message" htmlFor={fieldId("message")}>
          <Textarea rows={4} {...text("message")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Suggested amount" htmlFor={fieldId("suggestedAmount")}>
            <Input {...numeric("suggestedAmount")} />
          </Field>
          <Field label="Currency" htmlFor={fieldId("currency")}>
            <select
              id={fieldId("currency")}
              value={v.currency}
              onChange={(e) => set("currency", e.target.value)}
              className="h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-textfield focus:border-slate-950 focus:outline-none"
            >
              {!DONATION_CURRENCIES.includes(v.currency) && (
                <option value={v.currency}>{v.currency || "Choose…"} (not supported)</option>
              )}
              {DONATION_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c} – {currencyName(c)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          label="Amount buttons"
          hint="Comma-separated, up to 6. Donors can also type their own amount."
          htmlFor={fieldId("presetAmounts")}
        >
          <Input placeholder="10, 25, 50, 100" {...text("presetAmounts")} />
        </Field>
        <Field label="Card button label" hint="Opens Stripe's secure checkout." htmlFor={fieldId("cardButtonLabel")}>
          <Input {...text("cardButtonLabel")} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={v.monthlyOption}
            onChange={(e) => set("monthlyOption", e.target.checked)}
          />
          Show &ldquo;Make this a monthly donation&rdquo; option
        </label>
        <Field
          label="Manage monthly donation link"
          hint="Stripe → Settings → Billing → Customer portal → Portal link. Shown to monthly donors so they can cancel or change their card. Leave empty to hide."
          htmlFor={fieldId("manageUrl")}
        >
          <Input placeholder="https://billing.stripe.com/p/login/…" {...text("manageUrl")} />
        </Field>
        <Field label="PayPal button label" htmlFor={fieldId("buttonLabel")}>
          <Input {...text("buttonLabel")} />
        </Field>
        <Field
          label="PayPal link"
          hint="Where the button sends donors (https://…). Leave empty to disable the button."
          htmlFor={fieldId("paypalUrl")}
        >
          <Input placeholder="https://www.paypal.com/donate/?hosted_button_id=…" {...text("paypalUrl")} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Donation popup</h2>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={v.popupEnabled}
            onChange={(e) => set("popupEnabled", e.target.checked)}
          />
          Show the popup to visitors
        </label>
        <Field label="Popup title" htmlFor={fieldId("popupTitle")}>
          <Input {...text("popupTitle")} />
        </Field>
        <Field label="Popup message" htmlFor={fieldId("popupMessage")}>
          <Textarea rows={3} {...text("popupMessage")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Popup amount" hint="Shown in the currency above." htmlFor={fieldId("popupAmount")}>
            <Input {...numeric("popupAmount")} />
          </Field>
          <Field label="Button label" htmlFor={fieldId("popupButtonLabel")}>
            <Input {...text("popupButtonLabel")} />
          </Field>
          <Field label="Show again every (days)" hint="0 = on every visit." htmlFor={fieldId("popupFrequencyDays")}>
            <Input {...numeric("popupFrequencyDays")} />
          </Field>
          <Field label="Delay before showing (seconds)" htmlFor={fieldId("popupDelaySeconds")}>
            <Input {...numeric("popupDelaySeconds")} />
          </Field>
        </div>
      </section>

      {/* Stays in view while scrolling the long form. */}
      <div className="sticky bottom-0 z-10 -mx-3 flex items-center gap-3 border-t border-slate-200 bg-white px-3 py-3 md:-mx-5 md:px-5 lg:col-span-2">
        <Button type="button" onClick={save} disabled={saving || !dirty}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {dirty ? "You have unsaved changes." : "All changes saved."}
        </span>
      </div>
    </div>
  );
}
