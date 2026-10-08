"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DonationSettings } from "@prisma/client";
import clientApiHandlers from "@/client/handlers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "donation-popup-last-shown";
const DAY_MS = 24 * 60 * 60 * 1000;

function lastShown(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function DonationPopup() {
  const pathname = usePathname();
  const skip = pathname.startsWith("/dashboard") || pathname.startsWith("/donate");
  const [settings, setSettings] = useState<DonationSettings | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (skip) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    clientApiHandlers.settings.getDonationSettings().then((res) => {
      const s = res.data;
      if (cancelled || !res.succeed || !s || !s.popupEnabled) return;
      if (Date.now() - lastShown() < s.popupFrequencyDays * DAY_MS) return;
      setSettings(s);
      timer = setTimeout(() => {
        setOpen(true);
        try {
          localStorage.setItem(STORAGE_KEY, String(Date.now()));
        } catch {}
      }, s.popupDelaySeconds * 1000);
    });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [skip]);

  if (!settings || skip) return null;
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: settings.currency || "USD",
    minimumFractionDigits: Number.isInteger(settings.popupAmount) ? 0 : 2,
  }).format(settings.popupAmount);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center text-center sm:text-center">
          <DialogTitle>{settings.popupTitle}</DialogTitle>
          <DialogDescription className="whitespace-pre-line">
            {settings.popupMessage}
          </DialogDescription>
        </DialogHeader>
        <p className="text-4xl font-bold text-primary-dark">{amount}</p>
        <Button variant="primary" className="h-11 w-full" asChild>
          <a href="/donate" onClick={() => setOpen(false)}>
            {settings.popupButtonLabel}
          </a>
        </Button>
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => setOpen(false)}
        >
          Maybe later
        </button>
      </DialogContent>
    </Dialog>
  );
}
