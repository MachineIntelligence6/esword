import ChangePasswordForm from "@/components/frontend/forms/change-password.form";
import { StaticContentPage } from "@/components/frontend/static-content-page";
import { getServerAuth } from "@/server/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getServerAuth();
  if (typeof session === "boolean" || !session?.user) return redirect("/login");

  return (
    <StaticContentPage title="My account">
      <div className="mx-auto w-full max-w-md rounded-lg border border-silver-light bg-white px-6 py-8">
        <p className="text-sm text-primary-dark">{session.user.name}</p>
        <p className="pb-4 text-sm text-muted-foreground">{session.user.email}</p>
        <h3 className="pb-4 text-lg font-bold text-primary-dark">Change password</h3>
        <ChangePasswordForm />
      </div>
    </StaticContentPage>
  );
}
