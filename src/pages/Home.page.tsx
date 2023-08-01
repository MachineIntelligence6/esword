
import BooksChapterComponent from "@/components/BooksChapterComponent";
import Editor from "@/components/EditiorComponent";
import HeaderComponent from "@/components/HeaderComponent";
import VersesComponent from "@/components/VersesComponent";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRef } from 'react';






export default function HomePage() {
    // For zoom in and zoom out Buttons

    const [scale, setScale] = useState(1);

    const handleZoomIn = () => {
        setScale((prevScale) => Math.min(1.6, prevScale + 0.1));  // Increase scale by 0.1
    };

    const handleZoomOut = () => {
        setScale((prevScale) => Math.max(0.6, prevScale - 0.1)); // Decrease scale by 0.1 but never below 0.1
    };


    const highlightRef = useRef(null);

    const toggleHighlight = (): void => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return; // Do nothing if there is no active selection or no range
        }

        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'highlight bg-yellow-200';
        const isHighlighted = range.commonAncestorContainer.parentElement?.classList.contains('highlight');

        if (isHighlighted) {
            const parentElement = range.commonAncestorContainer.parentElement;
            if (parentElement) {
                parentElement.outerHTML = parentElement.innerHTML;
            }
        } else {
            range.surroundContents(span);
        }

        selection.removeAllRanges();
    };

    return (
        <>
            <HeaderComponent />
            <div className="flex lg:flex-row flex-col max-h-screen lg:overflow-hidden  ">
                <div className="pt-[60px]">
                    <BooksChapterComponent />
                </div>
                <div className="md:pt-[60px] " >
                    <div className="lg:flex block w-full">
                        <div
                            className="flex flex-col xl:max-w-[70%] xl:min-w-[70%] lg:min-w-[60%] lg:max-w-[60%] w-full border-r-[10px]">
                            <div className="flex mainDiv flex-col lg:h-auto w-auto">
                                <div
                                    className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 px-[10px] lg:border-0 border-b flex justify-between">
                                    <h3 className="text-xs font-bold">
                                        VERSES
                                    </h3>
                                    <button className="lg:hidden block rotate-180" id="expandAble">
                                        <img src="./images/arrowup.svg" className="toggle-arrow" />
                                    </button>
                                </div>
                                <div className="lg:block hidden  expanable-content">
                                    <div className="lg:flex block justify-between lg:border-b min-h-[39px] max-h-[39px]">
                                        <div
                                            className="flex xl:gap-x-12 lg:gap-x-3 md:w-full lg:w-auto lg:pr-7 lg:border-0 border-b lg:px-1 px-5 xl:px-6 justify-between items-center py-2">
                                            <button>
                                                <a href="">
                                                    <img src="./images/ph_play-light.svg" />
                                                </a>
                                            </button>
                                            <p>
                                                <img src="./images/line.svg" className="" />
                                            </p>
                                            <button type="button" className="highlighter" onClick={toggleHighlight}>
                                                <img src="./images/ph_text-aa-fill.svg" alt="" />
                                            </button>
                                            <button>
                                                <i className="fa-regular fa-bookmark"></i>
                                            </button>
                                            <p>
                                                <img src="./images/line.svg" alt="" />
                                            </p>
                                            <button type="button" className="zoom-in" onClick={handleZoomIn}>
                                                <img src="./images/zoomIn.svg" alt="" />
                                            </button>
                                            <button type="button" className="zoom-out" onClick={handleZoomOut}>
                                                <img src="./images/zoomout.svg" alt="" />
                                            </button>
                                            <p>
                                                <img src="./images/line.svg" alt="" />
                                            </p>
                                            <button type="button" className="left-move">
                                                <img src="./images/leftarrow.svg" alt="" />
                                            </button>
                                            <button type="button" className="right-move">
                                                <img src="./images/rightarrow.svg" alt="" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex  lg:mt-0 mt-[50px] max-w-full overflow-hidden max-h-screen" ref={highlightRef}>
                                        <div className="overflow-auto w-full p-0 max-w-full">
                                            <div className="zoom-text bg-white" style={{ transform: `scale(${scale})` }}>
                                                <div className="flex items-center justify-center py-[10px]">
                                                    <h1 className="font-bold text-xl text-primary-dark">
                                                        The Creation of the World
                                                    </h1>
                                                </div>
                                                <div className="flex">
                                                    <div className="flex flex-col gap-y-[10px] px-5 data-change-font-on-click">
                                                        <VersesComponent
                                                            heading="Gen 1:1"
                                                            content=" In the beginning God created the heaven and the earth."
                                                        />
                                                        <VersesComponent
                                                            heading="Gen 1:2"
                                                            content=" And the earth was without form, and void; and darkness was upon the face of
                                                        the deep. And the Spirit of God moved upon the face of the waters"
                                                        />
                                                        <VersesComponent
                                                            heading="Gen 1:3"
                                                            content=" And God said, Let there be light: and there was light."
                                                        />
                                                        <VersesComponent
                                                            heading="Gen 1:4"
                                                            content=" And God saw the light, that it was good: and God divided the light from darkness"
                                                        />
                                                        <VersesComponent
                                                            heading="Gen 1:5"
                                                            content=" And God called the light Day, and the darkness he called Night.And the evening and the morning were the first day."
                                                        />
                                                        <VersesComponent
                                                            heading="Gen 1:6"
                                                            content=" And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters."
                                                        />
                                                        <VersesComponent
                                                            heading="Gen 1:7"
                                                            content=" And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so."
                                                        />
                                                        <VersesComponent
                                                            heading="Gen 1:8"
                                                            content=" And God called the firmament Heaven. And the evening and the morning were the second day"
                                                        />
                                                        <VersesComponent
                                                            heading="Gen 1:9"
                                                            content=" And God said, Let the earth bring forth grass, the herb yielding seed,and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so."
                                                        />
                                                        <VersesComponent
                                                            heading="Gen 1:10"
                                                            content="And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good."
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                        {/* Commentaries */}
                        <div className="xl:max-w-[30%] xl:min-w-[30%] lg:max-w-[40%] lg:min-w-[40%] max-h-full min-h-full" ref={highlightRef}>
                            <div className="lg:min-h-[400px] mainDiv">
                                <div
                                    className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b flex justify-between">
                                    <h3 className="text-xs font-bold">
                                        COMMENTARIES
                                    </h3>
                                    <button className="lg:hidden block rotate-180">
                                        <img src="./Resources/images/arrowup.svg" className="toggle-arrow" />
                                    </button>
                                </div>
                                <div className="lg:block hidden expanable-content">
                                    <div className="flex border-b min-h-[39px] max-h-[39px] items-center px-3">
                                        <button
                                            className="text-xs font-normal font-inter px-3 py-2 hover:bg-primary hover:font-bold">
                                            <a href="">
                                                F. B. Meyer
                                            </a>
                                        </button>
                                        <button
                                            className="text-xs font-normal font-inter font-inter px-4 py-2 hover:bg-primary hover:font-bold">
                                            <a href="">
                                                TSK Cross References
                                            </a>
                                        </button>
                                    </div>
                                    <div className="flex justify-between border-b items-center lg:px-3 px-5 py-2">
                                        <div className="flex lg:gap-x-5 md:gap-x-7 gap-x-5 items-center">
                                            <button>
                                                <img src="./images/ph_play-light.svg" alt="" />
                                            </button>
                                            <p>
                                                <img src="./images/line.svg" />
                                            </p>
                                            <button type="button" className="highlighter" onClick={toggleHighlight}
                                                id="highlightButton">
                                                <img src="/images/ph_text-aa-fill.svg" alt="" />
                                            </button>
                                            <button>
                                                <i className="fa-regular fa-bookmark"></i>
                                            </button>
                                            <p>
                                                <img src="./Resources/images/line.svg" alt="" />
                                            </p>
                                            <button type="button" className="zoom-in" >
                                                <img src="./images/zoomIn.svg" alt="" />
                                            </button>
                                            <button type="button" className="zoom-out">
                                                <img src="./images/zoomout.svg" alt="" />
                                            </button>
                                            <p>
                                                <img src="./images/line.svg" alt="" />
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-x-8">
                                            <button type="button" className="left-move">
                                                <img src="./images/leftarrow.svg" alt="" />
                                            </button>
                                            <button type="button" className="right-move">
                                                <img src="/images/rightarrow.svg" alt="" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-auto h-auto w-auto">
                                        <div
                                            className="min-h-screen lg:min-h-[200px] w-full zoom-text p-0 bg-white highlighter max-w-full">
                                            <h1
                                                className="font-bold text-light-green text-xl flex items-center justify-center pt-[10px]">
                                                Genesis 1:1-5
                                            </h1>
                                            <h3
                                                className="font-bold text-base text-primary-dark flex justify-center items-center py-[10px]">
                                                Beginings
                                            </h3>
                                            <p className="lg:pl-4 lg:pr-2 px-[10px] text-primary-dark font-normal text-sm">
                                                All beginnings must begin with God. Always put I for trotoite teat tons no
                                                the
                                                has
                                                an
                                                end first thought every morning, the first aim and 4 purpose of all
                                                activity.
                                                Bein
                                                the
                                                took tree year with God, and you will end it with the glory of the New
                                                Jerusalem. At
                                                first, as in the physical creation, your heart and life may seem to be
                                                "without
                                                form
                                                and
                                                void." Do not be discouraged, the Spirit of God is within you, brooding amid
                                                the
                                                darkness, and presently His Light will shine through. It is the blessed
                                                presence
                                                of
                                                the
                                                Lord


                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes section */}
                            <div className="flex flex-col h-auto mainDiv min-h-screen">
                                <div
                                    className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b flex justify-between ">
                                    <h3 className="text-xs font-bold">
                                        NOTES
                                    </h3>
                                    <button className="lg:hidden block rotate-180" id="expandNotes">
                                        <img src="./images/arrowup.svg" className="toggle-arrow" />
                                    </button>

                                </div>
                                <div className="lg:block hidden expanable-content ">


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
                                    <Editor />
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
                        </div>
                    </div>
                </div>

            </div>
        </>

    )
}
