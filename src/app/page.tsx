"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CommentariesContentComponent from "@/components/frontend/commentaries-section";
import NotesContentComponent from "@/components/frontend/notes-section";
import { VersesSection } from "@/components/frontend/verses-section";
import useWindowSize from "@/components/hooks/use-window-size";

// export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="w-full">
      <div className="lg:flex block w-full">
        <VersesSection />
        <RightSection />
      </div>
    </div>
  );
}

function RightSection() {
  const windowSize = useWindowSize();

  return (
    <div
      className="xl:max-w-[30%] xl:min-w-[30%] lg:max-w-[40%] lg:min-w-[40%] min-h-full lg:flex lg:flex-col"
      style={{
        ...(windowSize && {
          maxHeight: `${windowSize.height - 70}px`,
        }),
      }}
    >
      <div className="w-full h-full lg:h-1/2 overflow-hidden">
        <CommentariesContentComponent variant="DESKTOP" />
        <div className="block lg:hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="toggle-btn bg-silver-light py-3 lg:pl-3 pl-[19px] pr-[19px] lg:border-0 border-b flex justify-between lg:hidden">
                <h3 className="text-xs font-bold">COMMENTARIES</h3>
              </AccordionTrigger>
              <AccordionContent>
                <CommentariesContentComponent variant="MOBILE" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <div className="w-full h-1/2">
        <div className="hidden lg:block h-full">
          <NotesContentComponent />
        </div>
        <div>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[19px] pr-[19px] lg:border-0 border-b flex justify-between lg:hidden">
                <h3 className="text-xs font-bold">NOTES</h3>
              </AccordionTrigger>
              <AccordionContent>
                <NotesContentComponent />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
