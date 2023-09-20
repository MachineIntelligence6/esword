"use client";
import { BlogType } from "@prisma/client";
import { Card, CardContent } from "../ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import {
  ChevronDownIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import BookmarksList from "./bookmarks-list";
import { useBlogsStore } from "@/lib/zustand/blogsStore";
import { useEffect } from "react";
import { IBlog } from "@/shared/types/models.types";
import { cn, extractTextFromHtml } from "@/lib/utils";
import QuillEditor from "../ui/editor";
import {
  BlogContentLoadingPlaceholder,
  BlogLoadingPlaceholder,
} from "../loading-placeholders";
import { Button } from "../ui/button";
import { BasePaginationProps } from "@/shared/types/api.types";

type Props = {
  variant: BlogType;
};

export default function BlogsPageComponent({ variant }: Props) {
  const { activeBlog, blogsList, loadingBlogs, loadBlogsData } =
    useBlogsStore();
  useEffect(() => {
    loadBlogsData(variant, 1);
  }, [variant, loadBlogsData]);

  return (
    <div className="w-full bg-white">
      <div className="grid-cols-11 lg:grid ">
        <div className="block bg-primary lg:hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className=" bg-silver-light py-3 font-inter lg:pl-3 pl-5 pr-[19px] flex justify-between w-full border-b-2">
                <h3 className="text-xs font-bold capitalize text-primary-dark">
                  {variant}S
                </h3>
                <ChevronDownIcon className="w-4 h-4 transition-transform duration-200 shrink-0 text-stone-500 dark:text-stone-400 " />
              </AccordionTrigger>
              <AccordionContent className="p-0 overflow-auto ">
                <BlogsContent variant={variant} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <h3 className="text-xs font-bold py-3 lg:pl-3 px-5 lg:px-[10px]  border-r-2 w-full bg-silver-light col-span-7 capitalize ">
          {activeBlog?.title}
        </h3>
        <h3 className="text-xs font-bold py-3 lg:pl-3 px-5 lg:px-[10px] lg:border-0 border-b w-full bg-silver-light col-span-4 lg:block capitalize hidden">
          {variant}S
        </h3>
      </div>
      <div className="lg:grid grid-cols-11 max-h-[calc(100vh_-_100px)] overflow-y-auto  ">
        <div className="col-span-7 w-full text-primary-dark text-base font-normal font-roman lg:border-r-[10px]  ">
          <div className="flex">
            <div className="w-full p-4 space-y-3 overflow-y-auto">
              {/* Active Blog Content  */}
              {!loadingBlogs && blogsList ? (
                activeBlog && (
                  <QuillEditor disabled value={activeBlog?.content} />
                )
              ) : (
                <BlogContentLoadingPlaceholder />
              )}
            </div>
            <BookmarksList />
          </div>
        </div>
        <div className="hidden w-full h-screen col-span-4 overflow-auto bg-primary lg:block ">
          <BlogsContent variant={variant} />
        </div>
      </div>
    </div>
  );
}

type BlogsContentProps = {
  variant: BlogType;
};

function BlogsContent({ variant }: BlogsContentProps) {
  const { blogsList, loadingBlogs, setActiveBlog } = useBlogsStore();

  return (
    <div className="relative min-h-full overflow-hidden overflow-y-auto">
      <div className="p-5  space-y-4 pb-20 lg:pb-0 lg:max-h-[calc(100vh_-_100px)] overflow-y-auto overflow-hidden">
        {!loadingBlogs && blogsList ? (
          blogsList.length > 0 ? (
            <div className="space-y-2 md:space-y-5">
              {blogsList?.map((blog) => (
                <BlogListItem
                  key={blog.id}
                  blog={blog}
                  onClick={() => setActiveBlog(blog)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-80">
              <p className="text-white">No data found.</p>
            </div>
          )
        ) : (
          <div className="space-y-2 md:space-y-5">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <Card key={num} className="w-full bg-white">
                <CardContent className="p-4 py-2">
                  <BlogLoadingPlaceholder />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div className="absolute z-[2] bottom-5 lg:bottom-12   w-full overflow-hidden bg-primary px-5">
        <BlogsPagination variant={variant} />
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  return format(date, "EEEE, d MMMM yyyy");
}

type BlogListItemProps = {
  blog: IBlog;
  className?: string;
  onClick?: () => void;
};

export function BlogListItem({ blog, onClick }: BlogListItemProps) {
  return (
    <Card
      className="w-full bg-white cursor-pointer"
      role="button"
      onClick={onClick}
    >
      <CardContent className="p-4 py-2">
        <div className="md:space-y-1">
          <div className="flex items-center justify-between gap-1">
            <h1 className="text-xs font-bold line-clamp-1 font-roman text-primary-dark/80 xl:text-lg">
              {blog.title}
            </h1>
            <p className="font-normal text-[7px] text-primary-dark xl:text-[9px] min-w-fit">
              ({formatDate(new Date(blog.createdAt))})
            </p>
          </div>
          <div className="overflow-hidden text-sm font-normal font-roman overflow-ellipsis line-clamp-1">
            {extractTextFromHtml(blog.content)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type BlogsPaginationProps = {
  variant: BlogType;
};

export function BlogsPagination({ variant }: BlogsPaginationProps) {
  const {
    loadBlogsData,
    blogsPagination,
    currentPage,
    loadingBlogs,
    blogsList,
  } = useBlogsStore();
  const totalPages = blogsPagination?.totalPages ?? 0;
  const onPageChange = (page: number) => {
    loadBlogsData(variant, page);
  };

  const getVisiblePages = () => {
    const visiblePages: number[] = [];
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      if (currentPage > 1) {
        visiblePages.push(currentPage - 1);
      }
      visiblePages.push(currentPage);
      while (visiblePages.length < 4) {
        const page = visiblePages[visiblePages.length - 1] + 1;
        if (page <= totalPages) visiblePages.push(page);
      }
    }
    return visiblePages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="bg-white px-3 py-1 rounded-lg  w-full max-w-[800px]">
      <div className="flex justify-between gap-10 md:gap-2">
        {totalPages > 0 && blogsList && blogsList.length > 0 ? (
          <div className="flex w-[100px] items-center md:justify-center text-xs md:text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center space-x-2 x">
          <Button
            variant="primary-outline"
            className="flex w-8 h-8 p-0"
            onClick={() => onPageChange(0)}
            disabled={currentPage <= 1 || loadingBlogs}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="primary-outline"
            className="w-8 h-8 p-0"
            onClick={() =>
              onPageChange(currentPage > 1 ? currentPage - 1 : currentPage)
            }
            disabled={currentPage <= 1 || loadingBlogs}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          {visiblePages.length > 0 && visiblePages[0] > 1 && (
            <Button variant="primary-outline" className="w-8 h-8 p-0" disabled>
              <span>...</span>
            </Button>
          )}
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant="primary-outline"
              className={cn(
                "h-8 w-8 p-0",
                currentPage === page && "!bg-primary !text-white"
              )}
              onClick={() => onPageChange(page)}
              disabled={currentPage === page || loadingBlogs}
            >
              <span>{page}</span>
            </Button>
          ))}
          {totalPages > visiblePages.length && (
            <Button variant="primary-outline" className="w-8 h-8 p-0" disabled>
              <span>...</span>
            </Button>
          )}
          <Button
            variant="primary-outline"
            className="w-8 h-8 p-0"
            onClick={() =>
              onPageChange(
                currentPage < totalPages ? currentPage + 1 : currentPage
              )
            }
            disabled={currentPage >= totalPages || loadingBlogs}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="primary-outline"
            className="flex w-8 h-8 p-0 "
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || loadingBlogs}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
