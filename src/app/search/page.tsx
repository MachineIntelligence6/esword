'use client'
import clientApiHandlers from "@/client/handlers";
import { SearchLoadingPlaceholder } from "@/components/loading-placeholders";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedApiResponse } from "@/shared/types/api.types";
import { IVerse } from "@/shared/types/models.types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import useSwr from 'swr'



const placeholderItems = [1, 2, 3, 4]

export default function Page() {
    const searchParams = useSearchParams()
    const query = searchParams.get("q") ?? "";
    const { data: searchResult, isLoading } = useSwr<PaginatedApiResponse<IVerse[]>>(
        `/api/search?query=${query}`,
        async () => {
            const res = await clientApiHandlers.search.findAll({ query })
            return res
        }
    )


    return (
        <div className="w-full">
            <div className="toggle-btn bg-silver-light w-full py-3 font-inter lg:pl-3 px-[10px] lg:border-0 border-b  justify-between  hidden lg:flex">
                <h3 className="text-xs font-bold">
                    Search Results for ( {query} )
                </h3>
            </div>
            <div className="w-full h-full bg-primary min-h-screen p-3">
                <Card>
                    <CardContent className="p-5">
                        {
                            isLoading || !searchResult?.data ?
                                <div className="divide-y-2 divide-silver-light">
                                    {
                                        placeholderItems.map((num) => (
                                            <div key={num} className="py-4">
                                                <SearchLoadingPlaceholder />
                                            </div>
                                        ))
                                    }
                                </div>
                                :
                                (
                                    searchResult.data.length > 0 ?
                                        <div className="divide-y-2 divide-silver-light">
                                            {
                                                searchResult?.data?.map((verse) => (
                                                    <div key={verse.id} className="w-full py-4">
                                                        <Highlighter
                                                            searchWords={[query]}
                                                            autoEscape
                                                            className="text-sm"
                                                            textToHighlight={verse.text}
                                                        />
                                                        <div className="flex items-center gap-5 mt-2">
                                                            <span className="text-xs">Book: <a href={`/?book=${verse.topic?.chapter?.book?.slug}`} className="text-primary">{verse.topic?.chapter?.book?.name}</a></span>
                                                            <span className="text-xs">Chapter: <a href={`/?book=${verse.topic?.chapter?.book?.slug}&chapter=${verse.topic?.chapter?.name}`} className="text-primary">{verse.topic?.chapter?.name}</a></span>
                                                            <span className="text-xs">Verse: <a href={`/?book=${verse.topic?.chapter?.book?.slug}&chapter=${verse.topic?.chapter?.name}&verse=${verse.number}`} className="text-primary">{verse.number}</a></span>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        :
                                        <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                                            <p>No results.</p>
                                        </div>
                                )
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
