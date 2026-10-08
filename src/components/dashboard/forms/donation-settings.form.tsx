"use client";

import { useState } from "react";
import { DonationSettings } from "@prisma/client";
import clientApiHandlers from "@/client/handlers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type Props = { settings: DonationSettings };

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function DonationSettingsForm({ settings }: Props) {
  const [v, setV] = useState<DonationSettings>(settings);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof DonationSettings>(k: K, val: DonationSettings[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));
  const text = (k: keyof DonationSettings) => ({
    value: String(v[k] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(k, e.target.value as never),
  });
  const numeric = (k: keyof DonationSettings) => ({
    type: "number" as const,
    min: 0,
    value: String(v[k]),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(k, (e.target.value === "" ? 0 : Number(e.target.value)) as never),
  });

  const save = async () => {
    setSaving(true);
    const { id, ...payload } = v;
    const res = await clientApiHandlers.settings.saveDonationSettings(payload);
    setSaving(false);
    if (res.succeed && res.data) {
      setV(res.data);
      toast({ title: "Saved", description: "Donation settings updated." });
    } else {
      toast({
        title: "Could not save",
        variant: "destructive",
        description:
          res.code === "VALIDATION_ERROR"
            ? "PayPal link must start with https://"
            : "Some error occured while processing your request, please try again.",
      });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <h2 className="text-lg font-bold">Donate page</h2>
        <Field label="Page title (top bar)">
          <Input {...text("pageTitle")} />
        </Field>
        <Field label="Heading">
          <Input {...text("heading")} />
        </Field>
        <Field label="Organization name">
          <Input {...text("orgName")} />
        </Field>
        <Field label="Message">
          <Textarea rows={4} {...text("message")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Suggested amount">
            <Input {...numeric("suggestedAmount")} />
          </Field>
          <Field label="Currency" hint="3-letter code, e.g. USD">
            <Input maxLength={3} {...text("currency")} />
          </Field>
        </div>
        <Field label="Button label">
          <Input {...text("buttonLabel")} />
        </Field>
        <Field
          label="PayPal link"
          hint="Where the button sends donors (https://…). Leave empty to disable the button."
        >
          <Input placeholder="https://www.paypal.com/donate/?hosted_button_id=…" {...text("paypalUrl")} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={v.monthlyOption}
            onChange={(e) => set("monthlyOption", e.target.checked)}
          />
          Show &ldquo;Make this a monthly donation&rdquo; option
        </label>
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
        <Field label="Popup title">
          <Input {...text("popupTitle")} />
        </Field>
        <Field label="Popup message">
          <Textarea rows={3} {...text("popupMessage")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Popup amount" hint="Shown in the currency above.">
            <Input {...numeric("popupAmount")} />
          </Field>
          <Field label="Button label">
            <Input {...text("popupButtonLabel")} />
          </Field>
          <Field label="Show again every (days)" hint="0 = on every visit.">
            <Input {...numeric("popupFrequencyDays")} />
          </Field>
          <Field label="Delay before showing (seconds)">
            <Input {...numeric("popupDelaySeconds")} />
          </Field>
        </div>
      </section>

      <div className="lg:col-span-2">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
