import DonationSettingsForm from "@/components/dashboard/forms/donation-settings.form";
import DonationsReceived from "@/components/dashboard/donations-received";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import serverApiHandlers from "@/server/handlers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [{ data: settings }, { data: overview }] = await Promise.all([
    serverApiHandlers.settings.getDonationSettings(),
    serverApiHandlers.donations.getDonations(),
  ]);

  return (
    <Card className="min-h-[600px]">
      <CardHeader className="border-b-8 border-silver-light py-4">
        <CardTitle className="font-bold text-2xl">Donations</CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-5 md:p-5">
        <Tabs defaultValue="received">
          <TabsList className="mb-5">
            <TabsTrigger value="received">Donations received</TabsTrigger>
            <TabsTrigger value="settings">Page &amp; popup</TabsTrigger>
          </TabsList>
          <TabsContent value="received">
            {overview ? <DonationsReceived overview={overview} /> : <p>Could not load donations.</p>}
          </TabsContent>
          <TabsContent value="settings">
            {settings ? (
              <DonationSettingsForm settings={settings} />
            ) : (
              <p>Could not load donation settings.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
