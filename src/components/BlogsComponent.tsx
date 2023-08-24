import React from "react";
import { Card, CardContent } from "./ui/card";

type Props = {
    heading: React.ReactNode;
    date: React.ReactNode;
    src: string;
    footer: React.ReactNode;
    className?: string;
    isDetailPage?: boolean;
};

export default function BlogsComponent({ heading, date, footer, src, isDetailPage }: Props) {
    const dynamicClasses = `flex flex-col gap-2 justify-between md:gap-3 w-full ${isDetailPage ? "md:px-20 px-3" : ""}`;
    return (
        <Card className="bg-white w-full">
            <CardContent>
                <div className="md:flex flex-col gap-2 pt-2 md:gap-3 md:py-5 w-full text-primary-dark font-inter ">
                    <a className="w-full overflow-hidden py-3 md:py-0 h-[200px] xl:h-[300px]" href="/blgdetails">
                        <img src={src} className="h-full w-full object-cover object-center" />
                    </a>
                    <div className={dynamicClasses}>
                        <div className="space-y-2 md:space-y-3">
                            <h1 className="font-extrabold lg:text-2xl " >
                                {heading}
                            </h1>
                            <p className="lg:text-base text-sm font-medium">
                                {date}
                            </p>
                        </div>
                        <div className="text-sm font-medium flex md:text-base">
                            {footer}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


