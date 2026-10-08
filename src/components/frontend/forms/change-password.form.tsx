"use client";

import { useState } from "react";
import clientApiHandlers from "@/client/handlers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/spinner";

const ERRORS: Record<string, string> = {
  WRONG_PASSWORD: "Your current password is incorrect.",
  RATE_LIMITED: "Too many incorrect attempts. Please try again in 15 minutes.",
  VALIDATION_ERROR:
    "New password must be at least 8 characters and different from the current one.",
};

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next.length < 8) return setError(ERRORS.VALIDATION_ERROR);
    if (next !== confirm) return setError("New passwords do not match.");
    setBusy(true);
    const res = await clientApiHandlers.users.changePassword(current, next);
    setBusy(false);
    if (res.succeed) {
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      setError(
        ERRORS[res.code ?? ""] ??
          "Some error occured while processing your request, please try again."
      );
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {done && (
        <p className="text-sm font-semibold text-green-600">
          Your password has been changed.
        </p>
      )}
      <Button type="submit" variant="primary" className="h-11 w-full" disabled={busy}>
        {busy ? <Spinner /> : "Change password"}
      </Button>
    </form>
  );
}
