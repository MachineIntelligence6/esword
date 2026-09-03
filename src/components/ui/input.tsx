import * as React from "react";

import { cn, resizeImage } from "@/lib/utils";
import { EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  /** `md` (44px) form default; `sm` (36px) for toolbar rows (Elisen Input). */
  size?: "sm" | "md";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error = false,
      leadingIcon,
      trailingIcon,
      size = "md",
      disabled,
      ...props
    },
    ref
  ) => {
    const [pwdVisible, setPwdVisible] = React.useState(false);
    const isPassword = type === "password";

    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-sm border bg-white px-3 shadow-textfield transition-colors duration-fast",
          size === "sm" ? "h-9" : "h-11",
          error
            ? "border-danger"
            : "border-slate-200 focus-within:border-slate-950",
          disabled && "opacity-40",
          className
        )}
      >
        {leadingIcon && (
          <span className="shrink-0 text-slate-500" aria-hidden>
            {leadingIcon}
          </span>
        )}
        <input
          type={isPassword ? (pwdVisible ? "text" : "password") : type}
          className="w-full min-w-0 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
          ref={ref}
          disabled={disabled}
          aria-invalid={error || undefined}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setPwdVisible(!pwdVisible)}
            className="shrink-0 rounded-sm p-0.5 text-slate-500 transition-colors hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
            aria-label={pwdVisible ? "Hide password" : "Show password"}
          >
            {pwdVisible ? (
              <EyeNoneIcon className="h-4 w-4" />
            ) : (
              <EyeOpenIcon className="h-4 w-4" />
            )}
          </button>
        ) : (
          trailingIcon && (
            <span className="shrink-0 text-slate-500" aria-hidden>
              {trailingIcon}
            </span>
          )
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

type FileInputProps = InputProps & {
  onFileChange?: (value: string | null) => void;
  file?: File;
};

const FileInput = ({
  className,
  type,
  onFileChange,
  file,
  children,
  required,
  readOnly,
  disabled,
}: FileInputProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div
      role="button"
      className={cn("w-full h-full cursor-pointer", className)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        hidden
        readOnly={readOnly}
        disabled={disabled}
        onChange={async (e) => {
          const files = e.target.files;
          const file = files?.item(0);
          if (file) {
            const imageB64 = await resizeImage(file);
            onFileChange?.(imageB64);
          }
        }}
      />
      {children}
    </div>
  );
};

type InputElProps = InputProps & {
  leading?: React.ReactNode;
};

const InputEl = React.forwardRef<HTMLInputElement, InputElProps>(
  ({ className, leading, type, error, leadingIcon, trailingIcon, size, ...props }, ref) => {
    return (
      <div
        className={cn(
          "w-full rounded-sm border border-slate-200 bg-white flex items-center h-11 shadow-textfield",
          className
        )}
      >
        {leading && (
          <span className="min-w-max h-[90%] text-sm flex items-center px-3 border-r border-slate-200 text-slate-500">
            {leading}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex w-full h-full px-3 rounded-sm text-sm text-slate-950 transition-colors bg-transparent file:border-0 file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
InputEl.displayName = "InputEl";

export { Input, InputEl, FileInput };
