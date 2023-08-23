import { DBooksCard, DCommentariesCard, DLogsCard, DNotesCard } from "./dashboard-cards";



export default function Page() {
    return (
        <div className="grid grid-cols-2 gap-5 max-h-[calc(100vh_-_100px)] pb-10 pr-2 overflow-y-auto">
            <div className="col-span-1">
                <DBooksCard />
            </div>
            <div className="col-span-1">
                <DNotesCard />
            </div>
            <div className="col-span-1">
                <DCommentariesCard />
            </div>
            <div className="col-span-1">
                <DLogsCard />
            </div>
        </div>
    )
}


