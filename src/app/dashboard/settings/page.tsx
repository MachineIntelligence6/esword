'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImportIVersesComponent } from "./components"


export default function Page() {

    return (
        <div>
            <Card className="min-h-[600px] ">
                <CardHeader className="border-b-8 border-silver-light py-4">
                    <CardTitle className="text-2xl">Settings</CardTitle>
                </CardHeader>
                <CardContent className="px-3 py-5 md:p-5">
                    <div className="md:grid grid-cols-2">
                        <div className="col-span-1 w-full">
                            <ImportIVersesComponent />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}



