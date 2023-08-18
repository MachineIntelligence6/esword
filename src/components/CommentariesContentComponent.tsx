import { useRef, useState } from "react";

export default function CommentariesContentComponent() {
    // javascript code for text highliter
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
    // zoom in and zoom out properties
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
            <div className="lg:min-h-[400px] mainDiv">
                {/* title */}
                <div
                    className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b lg:flex justify-between hidden">
                    <h3 className="text-xs font-bold">
                        COMMENTARIES
                    </h3>
                </div>
                <div className=" expanable-content">
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
                    {/* Button tabs */}
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
                            <button type="button" className="zoom-in" onClick={handleZoomIn}>
                                <img src="./images/zoomIn.svg" alt="" />
                            </button>
                            <button type="button" className="zoom-out" onClick={handleZoomOut}>
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
                    {/*  content */}
                    <div className="h-auto w-auto overflow-hidden" ref={highlightRef}>
                        <div
                            className="min-h-screen lg:min-h-[200px] w-full zoom-text p-0 bg-white highlighter max-w-full overflow-auto" >
                            <div style={{ transform: `scale(${scale})` }}>
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
                </div>
            </>
            )
}