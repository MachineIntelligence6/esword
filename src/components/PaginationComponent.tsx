import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";





export default function PaginationComponent() {
    return (
        <div className="flex items-center gap-3 text-primary-dark font-inter">
            <a href="#" className="flex items-center bg-white px-4 py-2  rounded-md">
                <ChevronLeftIcon/>
            </a>
            <a href="#" className="px-3 py-1 bg-white rounded-md hover:bg-primary/30 hover:text-primary-dark hover:font-bold">
                1
            </a>
            <a href="#" className="px-3 py-1 bg-white rounded-md hover:bg-primary/30 hover:text-primary-dark hover:font-bold">
                2
            </a>
            <a href="#" className="px-3 py-1 bg-white rounded-md hover:bg-primary/30 hover:text-primary-dark hover:font-bold">
                3
            </a>
           
            <a href="#" className="px-4 py-2 bg-white  rounded-md hover:bg-primary/30 hover:text-primary-dark hover:font-bold">
                <ChevronRightIcon />
            </a>
        </div>
    )
}