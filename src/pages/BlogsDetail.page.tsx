import BlogsComponent from "@/components/BlogsComponent";
import BooksChapterComponent from "@/components/BooksChapterComponent";
import HeaderComponent from "@/components/HeaderComponent";


export default function BlogsDetailPage() {
    return (
        <div>
            <HeaderComponent />
            <div className="flex lg:flex-row flex-col max-h-screen  pt-[60px] ">

                <div className="">
                    <BooksChapterComponent />
                </div>
                <div className="w-full ">
                    <h3 className="text-xs font-bold py-3 font-inter lg:pl-3 px-[10px] lg:border-0 border-b  w-full bg-silver-light ">
                        Manuscript
                    </h3>
                    <div className="p-5 max-h-[calc(100vh_-_100px)] overflow-auto bg-silver-light/40  " >
                        <BlogsComponent
                            isDetailPage
                            className="bg-white"
                            src="./images/login.PNG"
                            date="August 23, 2023 "
                            heading="RBA Pilot Finds CBDC Could Enhance Payments, Tokenization, and Inclusion"
                            footer={
                                <>
                                    Discover where art and AI collide as visionary artist Hagen Pietsch unveils his inaugural NFT collection, "RoboMetamorphs”, a eamless integration of AI-generated imagery and animation, as delightful little robots gracefully transform into captivating forms, showcasing the ever-evolving nature of AI technology  Lorem ipsum dolor sit amet consectetur adipisicing elit. At impedit esse dignissimos, dolores accusantium !.Lorem ipsum dolor sit amet, consectetur adipisicing elit. <br /><br /> Provident, sint quis, delectus voluptates, perferendis libero perspiciatis obcaecati voluptatem possimus deleniti soluta eligendi molestias autem corporis quae id exercitationem vero ratione nihil quibusdam eaque amet.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis provident sit accusamus velit quod minus reiciendis eveniet. <br /><br />Sapiente distinctio veniam, minus accusantium cumque minima aspernatur? Repudiandae quasi ipsam repellendus quod doloribus? Pariatur, minus, magni consequatur neque a cupiditate minima fuga labore, maiores voluptatibus quos rerum! <br /><br />Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt animi temporibus cum, aspernatur accusantium eligendi expedita iste excepturi quam. Aliquam enim rem voluptates! Lorem ipsum dolor sit, amet consectetur adipisicing elit. Veniam distinctio temporibus eos quae, voluptatibus nemo sapiente perspiciatis omnis quos numquam, tempore, error consequatur a similique consectetur blanditiis dolores dolor? Quidem saepe unde deleniti quam! Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias modi suscipit cupiditate fugiat quas nihil odit est sapiente sint blanditiis sequi tempora, quae minus beatae, repellendus voluptate minima labore ab, laboriosam consequuntur molestiae! Officia et, voluptate sit quae, explicabo hic ex quibusdam at mollitia doloremque neque expedita reprehenderit vitae facere. Dolorem impedit ipsa aliquam perspiciatis nihil.
                                </>
                            }
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}