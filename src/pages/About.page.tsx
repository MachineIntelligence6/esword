import BooksChapterComponent from "@/components/BooksChapterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { Card, CardContent, } from "@/components/ui/card";



export default function AboutUsPage() {
    return (
        <div>
            <HeaderComponent />
            <div className="flex lg:flex-row flex-col max-h-screen pt-[60px]">
                <div>
                    <BooksChapterComponent />
                </div>
                <div className="w-full">
                    <h3 className="text-xs font-bold py-3 lg:pl-3 px-[10px] lg:border-0 border-b  w-full bg-silver-light ">
                        About Us
                    </h3>
                    <div className="flex items-center justify-center p-10">
                        <Card className="bg-silver-light/20 py-5 ">
                            <CardContent className="gap-5 flex flex-col">                               
                                <h1 className="font-extrabold text-5xl text-center">
                                    Our Story
                                </h1>
                                <p>
                                    An About Us page is a section on a website that provides information about a company, organization, or individual. It is an opportunity to tell your brand’s story, share your vision, history, values, and achievements, and introduce team members. This is where you build trust and credibility with customers.
                                    In Shopify’s customer trust research, we found shoppers navigate to an About Us page to learn more about the brand and the people behind the products. Your About Page should address those two curiosities shoppers have to help them with decision making.
                                    Shoppers are also interested in a company’s mission. They’ll use the About Us page to determine if they share core values with the business and to decide if they want to shop with you or not.
                                </p>
                                <h1 className="font-extrabold text-3xl text-center">
                                    Who we are??
                                </h1>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque nam a accusamus aspernatur alias iste soluta culpa facilis at ratione, sit minus autem dolores molestias aut, in eaque incidunt id labore repudiandae aliquid! Voluptates. Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita impedit officiis, quos consectetur dolor, voluptates similique ipsam voluptatibus doloremque ad atque repudiandae quidem ex molestiae cumque iure a. Commodi, hic ut pariatur vitae odit dolores debitis cupiditate dicta minus aperiam asperiores, suscipit rem porro quasi labore veritatis? Praesentium, officiis quisquam! Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam repellat ullam, velit, itaque laboriosam vel sed accusantium modi sapiente natus aperiam inventore corporis veritatis quae. Amet suscipit a fugiat minus accusamus error dignissimos veritatis.
                                </p>
                                <h1 className="font-extrabold text-3xl text-center">
                                    What we do??
                                </h1>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque nam a accusamus aspernatur alias iste soluta culpa facilis at ratione, sit minus autem dolores molestias aut, in eaque incidunt id labore repudiandae aliquid! Voluptates. Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita impedit officiis, quos consectetur dolor, voluptates similique ipsam voluptatibus doloremque ad atque repudiandae quidem ex molestiae cumque iure a. Commodi, hic ut pariatur vitae odit dolores debitis cupiditate dicta minus aperiam asperiores, suscipit rem porro quasi labore veritatis? Praesentium, officiis quisquam! Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit, soluta! Nihil est nisi aliquid veritatis amet quibusdam officiis dignissimos possimus reprehenderit hic veniam quis, deserunt voluptas neque placeat ab velit saepe illo dolorum. Voluptatum consequuntur delectus sequi aut incidunt, deleniti cum eveniet aliquid natus asperiores nulla necessitatibus dolor, quas voluptates?Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sed commodi amet eaque repudiandae? Dolore suscipit praesentium voluptatibus vel, rerum a!
                                </p>                             
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}