'use client'

import { ImportIVersesComponent } from "./components"


export default function Page() {

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-bold text-2xl">
                    Settings
                </h1>
            </div>
            <div className="grid grid-cols-2">
                <div className="col-span-1">
                    <ImportIVersesComponent />
                </div>
            </div>
        </div>
    )
}



