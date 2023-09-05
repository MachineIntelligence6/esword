import Spinner from "@/components/spinner";

export default function Loading() {

  return (
    <div className="w-full flex items-center justify-center min-h-[500px]">
      <Spinner size="lg" />
    </div>
  )
}