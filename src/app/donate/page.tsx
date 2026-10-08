import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StaticContentPage } from "@/components/frontend/static-content-page";
import serverApiHandlers from "@/server/handlers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { data: s } = await serverApiHandlers.settings.getDonationSettings();
  if (!s) return <StaticContentPage title="Donate">Unavailable.</StaticContentPage>;

  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number.isInteger(s.suggestedAmount) ? 0 : 2,
  }).format(s.suggestedAmount);

  return (
    <StaticContentPage title={s.pageTitle} className="flex items-start justify-center md:pt-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-xl border border-silver-light bg-white px-6 pb-8 pt-10 text-center shadow-lg">
        <p className="text-2xl font-bold text-primary-dark">{s.heading}</p>
        <p className="pb-3 text-base font-normal text-primary-dark">{s.orgName}</p>
        <hr className="w-full border border-solid" />
        <p className="whitespace-pre-line px-2 py-3 text-sm font-normal text-primary-dark">
          {s.message}
        </p>
        <p className="pt-6 text-6xl font-bold text-primary-dark">
          <span className="align-top text-2xl">$</span>
          {amount}
        </p>
        <p className="py-2 text-base font-bold text-primary-dark">{s.currency}</p>
        {s.monthlyOption && (
          <label className="flex items-center gap-x-1 py-7">
            <Checkbox />
            <span>Make this a monthly donation</span>
          </label>
        )}
        <div className="w-full pt-2">
          {s.paypalUrl ? (
            <Button variant="primary" className="h-12 w-full" asChild>
              <a href={s.paypalUrl} target="_blank" rel="noopener noreferrer">
                {s.buttonLabel}
              </a>
            </Button>
          ) : (
            <Button variant="primary" className="h-12 w-full" disabled>
              {s.buttonLabel}
            </Button>
          )}
        </div>
      </div>
    </StaticContentPage>
  );
}
