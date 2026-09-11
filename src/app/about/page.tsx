import { StaticContentPage } from "@/components/frontend/static-content-page";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import serverApiHandlers from "@/server/handlers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { data: aboutContent } =
    await serverApiHandlers.settings.getAboutContent();
  const title = aboutContent?.title?.trim() || "About";
  const html = sanitizeRichHtml(aboutContent?.content);

  return (
    <StaticContentPage title={title}>
      {html ? (
        <div
          className="about-content mx-auto max-w-3xl space-y-4 text-base leading-7 text-primary-dark [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-sm text-primary-dark/70">
          About content has not been published yet.
        </p>
      )}
    </StaticContentPage>
  );
}
