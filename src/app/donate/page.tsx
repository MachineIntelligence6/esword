import DonateForm from "@/components/frontend/donate-form";
import { StaticContentPage } from "@/components/frontend/static-content-page";
import serverApiHandlers from "@/server/handlers";
import { getStripe } from "@/server/stripe";
import { parsePresetAmounts } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { data: s } = await serverApiHandlers.settings.getDonationSettings();
  if (!s) return <StaticContentPage title="Donate">Unavailable.</StaticContentPage>;

  // The popup links here with ?amount= so its amount is preselected.
  const linked = Number((await searchParams).amount);
  const initialAmount = Number.isFinite(linked) && linked > 0 ? linked : s.suggestedAmount;
  const presets = Array.from(
    new Set([...parsePresetAmounts(s.presetAmounts), ...(initialAmount > 0 ? [initialAmount] : [])])
  ).sort((a, b) => a - b);

  return (
    <StaticContentPage title={s.pageTitle} className="flex items-start justify-center md:pt-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-xl border border-silver-light bg-white px-6 pb-8 pt-10 text-center shadow-lg">
        <p className="text-2xl font-bold text-primary-dark">{s.heading}</p>
        <p className="pb-3 text-base font-normal text-primary-dark">{s.orgName}</p>
        <hr className="w-full border border-solid" />
        <p className="whitespace-pre-line px-2 py-3 text-sm font-normal text-primary-dark">
          {s.message}
        </p>
        <DonateForm
          currency={s.currency || "USD"}
          presets={presets}
          initialAmount={initialAmount}
          monthlyOption={s.monthlyOption}
          cardEnabled={getStripe() !== null}
          cardButtonLabel={s.cardButtonLabel}
          paypalUrl={s.paypalUrl}
          paypalButtonLabel={s.buttonLabel}
        />
        {s.manageUrl && s.monthlyOption && (
          <p className="pt-6 text-sm text-primary-dark">
            Already giving monthly?{" "}
            <a href={s.manageUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Manage your donation
            </a>
          </p>
        )}
      </div>
    </StaticContentPage>
  );
}
