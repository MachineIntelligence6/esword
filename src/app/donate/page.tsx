import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

export default function Page() {
  return (
    <div className="justify-center w-full bg-primary">
      <h3 className="text-xs text-primary-dark font-bold py-3 lg:pl-3 px-[20px] lg:border-0 border-b  w-full bg-silver-light uppercase">
        Donate
      </h3>
      <div className="flex min-h-[calc(100vh_-_100px)] items-center justify-center border-t-2 border-silver-light w-full ">
        <div className="md:w-[446px] w-auto  h-auto flex flex-col items-center justify-center bg-white pt-10 rounded-lg mx-4">
          <div>
            <p className="text-2xl font-bold text-primary-dark">Donate to</p>
          </div>
          <div className="pb-3">
            <p className="text-base font-normal text-primary-dark">
              Hidden Sword
            </p>
          </div>
          <hr className="w-full border border-solid " />
          <div className="px-4 py-2 text-center md:px-0">
            <p className="text-sm font-normal text-primary-dark">
              Thank you for supporting [org. name]. Lorem ipsum dolor imit
            </p>
          </div>
          <div className="flex">
            <Image
              src="/images/$.svg"
              alt=""
              width={11}
              height={20}
              className="pt-5"
            />
            <Image
              src="./images/0.00.svg"
              alt=""
              width={115}
              height={68}
              className="pt-8"
            />
          </div>
          <div>
            <p className="py-2 text-base font-bold text-primary-dark">USD</p>
          </div>
          <div className="flex items-center py-7 gap-x-1">
            <Checkbox />
            <p>Make this a monthly donation</p>
          </div>
          <div className="w-full px-8 mb-8">
            <Button variant="primary" className="w-full h-12">
              Donation with Paypal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
