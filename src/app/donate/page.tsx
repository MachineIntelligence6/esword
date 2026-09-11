import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StaticContentPage } from "@/components/frontend/static-content-page";
import Image from "next/image";

export default function Page() {
  return (
    <StaticContentPage title="Donate">
      <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-lg border border-silver-light bg-white px-6 pb-8 pt-10 text-center">
        <p className="text-2xl font-bold text-primary-dark">Donate to</p>
        <p className="pb-3 text-base font-normal text-primary-dark">
          Hidden Sword
        </p>
        <hr className="w-full border border-solid" />
        <p className="px-2 py-3 text-sm font-normal text-primary-dark">
          Thank you for supporting Hidden Sword and this work of making the
          writings freely available.
        </p>
        <div className="flex items-start">
          <Image
            src="/images/$.svg"
            alt=""
            width={11}
            height={20}
            className="h-auto w-auto pt-5"
          />
          <Image
            src="/images/0.00.svg"
            alt=""
            width={115}
            height={68}
            className="h-auto w-auto pt-8"
          />
        </div>
        <p className="py-2 text-base font-bold text-primary-dark">USD</p>
        <div className="flex items-center gap-x-1 py-7">
          <Checkbox />
          <p>Make this a monthly donation</p>
        </div>
        <div className="w-full">
          <Button variant="primary" className="h-12 w-full">
            Donation with Paypal
          </Button>
        </div>
      </div>
    </StaticContentPage>
  );
}
