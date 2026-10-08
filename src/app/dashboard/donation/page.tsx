import DonationSettingsForm from "@/components/dashboard/forms/donation-settings.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import serverApiHandlers from "@/server/handlers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { data: settings } =
    await serverApiHandlers.settings.getDonationSettings();

  return (
    <Card className="min-h-[600px]">
      <CardHeader className="border-b-8 border-silver-light py-4">
        <CardTitle className="font-bold text-2xl">
          Donation Page &amp; Popup
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-5 md:p-5">
        {settings ? (
          <DonationSettingsForm settings={settings} />
        ) : (
          <p>Could not load donation settings.</p>
        )}
      </CardContent>
    </Card>
  );
}
