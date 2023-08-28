import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";


export default function PaginationComponent() {
    return (
        <div className="flex items-center justify-end z-50 gap-3 text-primary-dark font-inter  bg-white px-3 py-2 rounded-lg  w-full max-w-[700px]  ">
            <a href="#" className="flex items-center justify-center h-8 w-8 bg-primary-dark  text-white rounded-md hover:bg-white hover:text-primary-dark hover:font-bold">
                <ChevronLeftIcon/>
            </a>
            <a href="#" className="px-3 py-1 bg-primary-dark text-white rounded-md hover:bg-white hover:text-primary-dark hover:font-bold">
                1
            </a>
            <a href="#" className="px-3 py-1 bg-primary-dark text-white rounded-md hover:bg-white hover:text-primary-dark hover:font-bold">
                2
            </a>
            <a href="#" className="px-3 py-1 bg-primary-dark text-white rounded-md hover:bg-white hover:text-primary-dark hover:font-bold">
                3
            </a>
           
            <a href="#" className="flex items-center justify-center h-8 w-8 bg-primary-dark  text-white rounded-md hover:bg-white hover:text-primary-dark hover:font-bold">
                <ChevronRightIcon />
            </a>
        </div>
    )
}