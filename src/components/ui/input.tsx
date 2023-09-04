import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"


type FileInputProps = InputProps & {
  onFileChange?: (file: File | null) => void;
  file?: File
}

const FileInput = ({ className, type, onFileChange, file, children, required, readOnly, disabled }: FileInputProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div
      role="button"
      className={cn(
        "w-full h-full cursor-pointer",
        className
      )}
      onClick={() => inputRef.current?.click()}
    // onClick={() => {
    //   const input = document.createElement("input");
    //   input.type = "file"
    //   input.accept = "image/*";
    //   input.click()
    //   input.onchange = (e) => {
    //     // const files = e.target?.;
    //     // if (files && files.length > 0) {
    //     //   onFileChange?.(files.item(0))
    //     // }
    //   }
    // }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        hidden
        required
        readOnly
        disabled
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            onFileChange?.(files.item(0))
          }
        }}
      />
      {children}
    </div>
  )
}




type InputElProps = InputProps & {
  leading?: React.ReactNode;
}

const InputEl = React.forwardRef<HTMLInputElement, InputElProps>(
  ({ className, leading, type, ...props }, ref) => {
    return (
      <div className={cn(
        "w-full rounded-md border border-slate-200 bg-white flex items-center h-10",
        className
      )}>
        {
          leading &&
          <span className="min-w-max h-[90%] text-sm flex items-center px-3 border-r border-slate-200">
            {leading}
          </span>
        }
        <input
          type={type}
          className={cn(
            "flex w-full h-full px-3 rounded-md text-sm shadow-sm transition-colors bg-transparent file:border-0 file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
InputEl.displayName = "InputEl"

export { Input, InputEl, FileInput }
