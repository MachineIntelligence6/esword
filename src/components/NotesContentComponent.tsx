import { Button } from "@/components/ui/button";





export default function NotesContentComponent() {
    return (
        <>
            <div className="flex flex-col h-auto mainDiv min-h-screen">
                <div
                    className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b lg:flex justify-between hidden">
                    <h3 className="text-xs font-bold">
                        NOTES
                    </h3>
                </div>
                <div className="lg:block  expanable-content ">
                    <div className="border-b">
                        <div className="flex text-xs  mx-3 my-1">
                            <Button variant={"secondary"}>
                                Journal Notes
                            </Button>
                            <Button variant={"secondary"}>
                                Study Notes
                            </Button>
                            <Button variant={"secondary"}>
                                Topic Notes
                            </Button>
                        </div>
                    </div>
                    {/* notes section after selceting books,chapter name and notes type */}
                    <div className="border-b">
                        <div className="flex  mx-3 my-1">
                            <Button variant={"secondary"}>
                                Book Name
                            </Button>
                            <Button variant={"secondary"}>
                                Chapter Index
                            </Button>
                            <Button variant={"secondary"}>
                                Notes className
                            </Button>
                        </div>
                    </div>
                    {/* <Editor /> */}
                    <div className="flex w-full">
                        <div className="bg-gray-200 w-full flex items-center justify-center">
                            <div className="bg-white w-full text-black border-b" x-data="app()"
                                x-init="init($refs.wysiwyg)">

                                {/* <div className="overflow-hidden px-1">
                                                <div
                                                    className="flex border-b w-full min-w-full border-gray-200 text-xl text-gray-600 flex-wrap py-[10px]">
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('bold')">
                                                        <i className="mdi mdi-format-bold"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('italic')">
                                                        <i className="mdi mdi-format-italic"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 mr-1 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('underline')">
                                                        <i className="mdi mdi-format-underline"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('formatBlock','P')">
                                                        <i className="mdi mdi-format-paragraph"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('formatBlock','H1')">
                                                        <i className="mdi mdi-format-header-1"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('formatBlock','H2')">
                                                        <i className="mdi mdi-format-header-2"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 mr-1 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('formatBlock','H3')">
                                                        <i className="mdi mdi-format-header-3"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('insertUnorderedList')">
                                                        <i className="mdi mdi-format-list-bulleted"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 mr-1 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('insertOrderedList')">
                                                        <i className="mdi mdi-format-list-numbered"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('justifyLeft')">
                                                        <i className="mdi mdi-format-align-left"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('justifyCenter')">
                                                        <i className="mdi mdi-format-align-center"></i>
                                                    </button>
                                                    <button
                                                        className="outline-none focus:outline-none w-[30px] h-7 hover:text-indigo-500 active:bg-gray-50"
                                                        @click="format('justifyRight')">
                                                        <i className="mdi mdi-format-align-right"></i>
                                                    </button>
                                                </div>
                                                <div className="w-full">
                                                    <iframe x-ref="wysiwyg"
                                                        className="w-full h-96 overflow-y-auto"></iframe>
                                                </div>
                                            </div> */}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}