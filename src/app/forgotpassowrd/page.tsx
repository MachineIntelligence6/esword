import { redirect } from "next/navigation";

/** Legacy typo URL from the login form; keep as a redirect so old links work. */
export default function Page() {
  redirect("/forgot-password");
}
