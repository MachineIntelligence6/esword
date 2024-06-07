import { Card, CardContent } from "@/components/ui/card";
import QuillEditor from "@/components/ui/editor";
import serverApiHandlers from "@/server/handlers";

export default async function Page() {
  const { data: aboutContent } =
    await serverApiHandlers.settings.getAboutContent();

  return (
    <div className="w-full h-full">
      <h3 className="text-xs font-bold py-3 lg:pl-3 px-5 lg:border-0 border-b  w-full bg-silver-light uppercase">
        {aboutContent?.title ?? "ABOUT US"}
      </h3>
      <div className="bg-primary flex  justify-center p-7">
        <Card className="bg-white w-full overflow-auto">
          <CardContent className="p-5 pb-8 h-auto flex flex-col gap-4 md:gap-16 ">
            <QuillEditor disabled value={aboutContent?.content} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
