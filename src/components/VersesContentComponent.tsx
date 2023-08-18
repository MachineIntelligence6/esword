import { useRef, useState } from "react";
import VersesComponent from "./VersesComponent";



export default function VersesContentComponent() {
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
    const [scale, setScale] = useState(1);

    const handleZoomIn = () => {
        setScale((prevScale) => Math.min(1.6, prevScale + 0.1));  // Increase scale by 0.1
    };
    const handleZoomOut = () => {
        setScale((prevScale) => Math.max(0.6, prevScale - 0.1)); // Decrease scale by 0.1 but never below 0.1
    };


    const highlightRef = useRef(null);
    return (
        <>
            {/* title */}
            <div className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 px-[10px] lg:border-0 border-b  justify-between  hidden lg:flex">
                <h3 className="text-xs font-bold">
                    VERSES
                </h3>
            </div>
            <div className="block expanable-content lg-open">
                {/* buttons tab */}
                <div className="lg:flex block justify-between lg:border-b min-h-[39px] max-h-[39px]">
                    <div className="flex xl:gap-x-12 lg:gap-x-3 md:w-full lg:w-auto lg:pr-7 lg:border-0 border-b lg:px-1 px-5 xl:px-6 justify-between items-center py-2">
                        <button>
                            <a href="">
                                <img src="./images/ph_play-light.svg" alt="Play" />
                            </a>
                        </button>
                        <p>
                            <img src="./images/line.svg" className="" alt="Line" />
                        </p>
                        <button type="button" className="highlighter" onClick={toggleHighlight}>
                            <img src="./images/ph_text-aa-fill.svg" alt="Highlight" />
                        </button>
                        <button>
                            <i className="fa-regular fa-bookmark"></i>
                        </button>
                        <p>
                            <img src="./images/line.svg" alt="Line" />
                        </p>
                        <button type="button" className="zoom-in" onClick={handleZoomIn}>
                            <img src="./images/zoomIn.svg" alt="Zoom In" />
                        </button>
                        <button type="button" className="zoom-out" onClick={handleZoomOut}>
                            <img src="./images/zoomout.svg" alt="Zoom Out" />
                        </button>
                        <p>
                            <img src="./images/line.svg" alt="Line" />
                        </p>
                        <button type="button" className="left-move">
                            <img src="./images/leftarrow.svg" alt="Left Arrow" />
                        </button>
                        <button type="button" className="right-move">
                            <img src="./images/rightarrow.svg" alt="Right Arrow" />
                        </button>
                    </div>
                </div>
                {/* content */}
                <div className="flex lg:mt-0 mt-[50px] max-w-full overflow-hidden max-h-screen" ref={highlightRef}>
                    <div className="overflow-y-auto w-full p-0 max-w-full">
                        <div className="zoom-text bg-white" style={{ transform: `scale(${scale})` }}>
                            <div className="flex items-center justify-center py-[10px]">
                                <h1 className="font-bold text-xl text-primary-dark">
                                    The Creation of the World
                                </h1>
                            </div>
                            <div className="flex flex-col gap-y-[10px]  data-change-font-on-click">
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
                    {/* bookmark icons section */}
                    <div className="flex flex-col gap-4 pt-3 px-2 w-10 overflow-y-auto">
                        <a href="">
                            <img src="/icons/bookfill-icon.png " className="bookmark" />
                        </a>
                        <a href="">
                            <img src="/icons/bookfill-icon.png " className="bookmark" />
                        </a>
                        <a href="">
                            <img src="/icons/bookfill-icon.png " className="bookmark" />
                        </a>
                        <a href="">
                            <img src="/icons/bookfill-icon.png " className="bookmark" />
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}