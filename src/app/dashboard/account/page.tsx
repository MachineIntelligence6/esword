import ChangePasswordForm from "@/components/frontend/forms/change-password.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerAuth } from "@/server/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getServerAuth();
  if (typeof session === "boolean" || !session?.user) return redirect("/login");

  return (
    <Card className="max-w-xl">
      <CardHeader className="border-b-8 border-silver-light py-4">
        <CardTitle className="font-bold text-2xl">Change password</CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-5 md:p-5">
        <p className="text-sm">{session.user.name}</p>
        <p className="pb-5 text-sm text-slate-500">{session.user.email}</p>
        <ChangePasswordForm />
      </CardContent>
    </Card>
  );
}
