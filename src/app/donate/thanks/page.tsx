import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StaticContentPage } from "@/components/frontend/static-content-page";
import serverApiHandlers from "@/server/handlers";
import { formatMoney, fromMinorUnits } from "@/lib/money";

export const dynamic = "force-dynamic";

// Stripe sends donors here after paying, with ?session_id={CHECKOUT_SESSION_ID}.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sessionId = (await searchParams).session_id;
  const [{ data: receipt }, { data: s }] = await Promise.all([
    serverApiHandlers.donations.confirmCheckout(typeof sessionId === "string" ? sessionId : ""),
    serverApiHandlers.settings.getDonationSettings(),
  ]);

  return (
    <StaticContentPage title={s?.pageTitle ?? "Donate"} className="flex items-start justify-center md:pt-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-xl border border-silver-light bg-white px-6 pb-8 pt-10 text-center shadow-lg">
        {receipt ? (
          <>
            <p className="text-2xl font-bold text-primary-dark">Thank you!</p>
            <p className="pt-4 text-4xl font-bold text-primary-dark">
              {formatMoney(fromMinorUnits(receipt.amount, receipt.currency), receipt.currency)}
              {receipt.monthly && <span className="text-lg font-semibold">/month</span>}
            </p>
            <p className="px-2 pt-4 text-sm text-primary-dark">
              {receipt.paid
                ? `Your ${receipt.monthly ? "monthly " : ""}donation${s?.orgName ? ` to ${s.orgName}` : ""} was received. A receipt is on its way to your email.`
                : "Your donation is being processed. You will get an email from Stripe once it goes through."}
            </p>
            {receipt.monthly && s?.manageUrl && (
              <p className="px-2 pt-3 text-sm text-primary-dark">
                You can cancel or change your card any time:{" "}
                <a href={s.manageUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  manage your monthly donation
                </a>
                .
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-primary-dark">Donation not found</p>
            <p className="px-2 pt-4 text-sm text-primary-dark">
              We could not find this payment. If you were charged, please contact us and we will sort it out.
            </p>
          </>
        )}
        <div className="w-full pt-8">
          <Button variant="primary" className="h-12 w-full" asChild>
            <Link href="/">Back to reading</Link>
          </Button>
        </div>
      </div>
    </StaticContentPage>
  );
}
