



export default function HeaderComponent() {
    return (
        <header >
            <nav className="flex justify-between lg:px-0  items-center h-[60px] fixed top-0 left-0 w-full z-50 bg-primary">
                <div className="lg:px-1">
                    <a href="/home">
                        <img src="./images/Hidden Sword Logo Enlarged.png" className="object-contain bg-cover w-[250px]" />
                    </a>
                </div>
                <div>
                    <div className="flex text-white lg:gap-x-11 md:gap-x-6 md:px-3 px-5 gap-x-1 text-sm ">
                        <div className="flex lg:gap-x-0">
                            <div className="font-bold py-3 lg:block hidden">
                                <a href="/home">Home</a>
                            </div>
                            <select name="" id="" className="bg-transparent lg:hidden md:w-auto w-16">
                                <option value="Home" className="text-black">Home</option>
                                <option value="Home" className="text-black">Donation</option>
                            </select>
                        </div>
                        <div>
                            <div className="font-normal py-3 lg:block hidden">
                                <a href="/donate">Donate</a>
                            </div>
                        </div>
                        <button className="flex gap-x-3 lg:border rounded-[42px] border-white border-opacity-70 items-center">
                            <i className="fa-solid fa-magnifying-glass pl-3"></i>
                            <p className="pr-[140px] font-normal lg:block hidden">
                                Search
                            </p>
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
}

