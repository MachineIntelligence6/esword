import { DBooksCard, DCommentariesCard, DActivitiesCard, DNotesCard } from "./dashboard-cards";



export default function Page() {
    return (
        <div className="grid grid-cols-2 gap-5">
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
                <DActivitiesCard />
            </div>
        </div>
    )
}


