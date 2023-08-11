


export default function  BooksChapterComponent () {
    return (
       <>
      <div className="flex lg:mx-0 mx-[10px] lg:my-0 my-1 gap-x-3 lg:gap-x-0 bg-white lg:max-w-[186px] lg:min-w-[186px] w-full  lg:px-0 px-3">
            <div
                className="lg:min-w-[130px] lg:max-w-[130px] w-full font-inter lg:border-0 lg:border-r-2 border border-solid text-primary-dark lg:rounded-none rounded-lg">
                <div className="lg:bg-silver-light bg-white py-3 flex lg:border-0 border-b flex-col">
                    <h3 className="lg:text-xs text-[10px] lg:font-bold font-normal px-5">
                        BIBLE BOOKS
                    </h3>
                    <select name="" id="Books" className="lg:hidden mx-4 pt-1">
                        <option value="Books">
                            Genesis
                        </option>
                        <option value="Books">
                            Exodus
                        </option>
                        <option value="Books">
                            Leviticus
                        </option>
                        <option value="Books">
                            Numbers
                        </option>
                        <option value="Books">
                            Deuteronomy
                        </option>
                        <option value="Books">
                            Joshua
                        </option>
                        <option value="Books">
                            Judges
                        </option>
                        <option value="Books">
                            Ruth
                        </option>
                        <option value="Books">
                            1 Samuel
                        </option>
                    </select>
                </div>
                <div className="h-[calc(100vh_-_100px)]  overflow-y-auto overflow-x-hidden lg:flex hidden">
                    <div className="font-normal font-inter text-sm cursor-pointer">
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Genesis
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Exodus
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Leviticus
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Numbers
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Deuteronomy
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Joshua
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Judges
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Ruth
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 ltransition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            1 Samuel
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            2 Samuel
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            1 Kings
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            2 Kings
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            1 Chronicles
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            2 Chronicles
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Ezra
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-allblock max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Nehemiah
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Genesis
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Exodus
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Leviticus
                        </a>
                        <a
                            className="hover:font-bold hover:bg-primary px-5 py-2 transition-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            Numbers
                        </a>

                    </div>
                </div>
            </div>
            <div
                className="lg:min-w-[56px] lg:max-w-[56px] w-full lg:border-r-2 lg:border-0 border text-primary-dark border-solid rounded-lg lg:rounded-none">
                <div className="lg:bg-silver-light bg-white py-3 font-inter lg:border-0 border-b flex flex-col">
                    <h3 className="lg:text-xs lg:font-bold font-normal text-[10px] lg:block hidden  px-3">
                        CH.
                    </h3>
                    <h3 className="font-normal text-[10px] uppercase lg:hidden px-4">
                        Chapter
                    </h3>
                    {/* For iphone and mobile responses  */}
                    <select name="" id="Chapter" className="lg:hidden pt-1 mx-4">
                        <option value="Chapter">
                            1
                        </option>
                        <option value="Chapter">
                            2
                        </option>
                        <option value="Chapter">
                            3
                        </option>
                        <option value="Chapter">
                            4
                        </option>
                        <option value="Chapter">
                            5
                        </option>
                        <option value="Chapter">
                            6
                        </option>
                        <option value="Chapter">
                            7
                        </option>
                    </select>
                </div>
                {/* h-[calc(100vh_-_100px)] */}
                <div className="lg:h-[calc(100vh_-_100px)]  overflow-y-auto">
                    <ul className="lg:flex flex-col hidden font-normal font-inter text-sm cursor-pointer">
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            1
                        </li>
                        <li className="hover:font-bold hover:bg-primary py-2 px-3 transition-all">
                            2
                        </li>
                        <li className="hover:font-bold hover:bg-primary py-2 px-3 transition-all">
                            3
                        </li>
                        <li className="hover:font-bold hover:bg-primary py-2 px-3 transition-all">
                            4
                        </li>
                        <li className="hover:font-bold hover:bg-primary py-2 px-3 transition-all">
                            5
                        </li>
                        <li className="hover:font-bold hover:bg-primary py-2 px-3 transition-all">
                            6
                        </li>
                        <li className="hover:font-bold hover:bg-primary py-2 px-3 transition-all">
                            7
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            8
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            9
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            10
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            11
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            12
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            13
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            14
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            15
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            16
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            17
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            18
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            19
                        </li>
                        <li className="hover:font-bold hover:bg-primary px-3 py-2 transition-all">
                            20
                        </li>
                    </ul>

                </div>

            </div>
        </div>
       </>
    );
}