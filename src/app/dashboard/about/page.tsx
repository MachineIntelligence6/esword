

import AboutContentForm from "@/components/dashboard/forms/aboutcontent.form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import serverApiHandlers from "@/server/handlers"



export default async function Page() {
    const { data: aboutContent } = await serverApiHandlers.settings.getAboutContent()

    return (
        <div>
            <Card className="min-h-[600px]">
                <CardHeader className="border-b-8 border-silver-light py-4">
                    <CardTitle className="font-bold text-2xl">
                        About Page Content
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 py-5 md:p-5">
                    <AboutContentForm aboutContent={aboutContent} />
                </CardContent>
            </Card>
        </div>
    )
}