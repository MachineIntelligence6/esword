"use client"
import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command"
import Spinner from "@/components/spinner"
import { Input } from "./input"
import { Separator } from "./separator"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-transparent placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-transparent disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretSortIcon className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-slate-100", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName



export type SelectOption = {
  label: string;
  value: string;
  rawValue: any;
}

type SelectElProps = {
  options?: Array<SelectOption>;
  loading?: boolean;
  value?: string;
  onChange?: (opt?: SelectOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SelectEl = React.forwardRef<HTMLSelectElement, SelectElProps>(({ options, placeholder, disabled, loading, onChange, value }, ref) => {
  const [filteredOpts, setFilteredOpts] = React.useState(options)
  const handleChange = (value: string) => {
    const option = options?.find((opt) => opt.value === value)
    // if (!option || !onChange) return;
    onChange?.(option)
  }


  React.useEffect(() => {
    setFilteredOpts(options)
  }, [options])

  const handleFilterChange = (val: string) => {
    setFilteredOpts(options?.filter((opt) => opt.label.toLowerCase().includes(val.toLowerCase())))
  }

  return (
    <Select onValueChange={handleChange} value={value} required>
      <SelectTrigger className="w-full h-10" disabled={disabled}>
        <SelectValue placeholder={placeholder ?? "Select"} />
      </SelectTrigger>
      <SelectContent className="p-0">
        {
          options && !loading &&
          <>
            <input className="flex w-full rounded-md bg-transparent py-2 px-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Search..." onChange={(e) => handleFilterChange(e.target.value)} />
            <Separator />
          </>
        }
        {
          loading ?
            <div className="w-full py-10 flex items-center justify-center">
              <Spinner className="w-10 h-10 border-4" />
            </div>
            :
            !filteredOpts || filteredOpts?.length <= 0 ?
              <div className="w-full py-10 flex items-center justify-center">
                <p>No data.</p>
              </div>
              :
              <div className="mt-2 max-h-96 overflow-y-auto ">
                {
                  filteredOpts?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                }
              </div>
        }
      </SelectContent>
    </Select>
  )
})
SelectEl.displayName = "SelectEl"

const ComboBox = React.forwardRef<HTMLSelectElement, SelectElProps>(({ options, placeholder, onChange, loading, value, disabled }, ref) => {
  const [open, setOpen] = React.useState(false)
  const [selectedOpt, setSelectedOpt] = React.useState<SelectOption | undefined>(options?.find((opt) => opt.value === value))
  const handleChange = (value: string) => {
    setOpen(false)
    const option = options?.find((opt) => opt.value === value)
    if (!option) return;
    setSelectedOpt(option)
  }

  React.useEffect(() => {
    setSelectedOpt(options?.find((opt) => opt.value === value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  React.useEffect(() => {
    onChange?.(selectedOpt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOpt])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          className="w-full justify-between h-10"
        >
          {selectedOpt ? selectedOpt.label : (placeholder ?? "")}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        {
          loading ?
            <div className="w-full py-10 flex items-center justify-center">
              <Spinner className="w-10 h-10 border-4" />
            </div>
            :
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandEmpty>No Data.</CommandEmpty>
              <CommandGroup className="max-h-96 w-full overflow-y-auto">
                {
                  options?.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleChange}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
        }
      </PopoverContent>
    </Popover>
  )
})
ComboBox.displayName = "ComboBox"


export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectEl,
  SideBarEl,
  ComboBox
}




export type SideBarOption = {
  label: string;
  value: string;
  rawValue: any;
}

type SideBarProps = {
  options?: Array<SideBarOption>;
  loading?: boolean;
  value?: string;
  onChange?: (opt?: SideBarOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SideBarEl = React.forwardRef<HTMLSelectElement, SideBarProps>(({ options, placeholder, disabled, loading, onChange, value }, ref) => {
  const [filteredOpts, setFilteredOpts] = React.useState(options)
  const handleChange = (value: string) => {
    const option = options?.find((opt) => opt.value === value)
    // if (!option || !onChange) return;
    onChange?.(option)
  }


  React.useEffect(() => {
    setFilteredOpts(options)
  }, [options])

  const handleFilterChange = (val: string) => {
    setFilteredOpts(options?.filter((opt) => opt.label.toLowerCase().includes(val.toLowerCase())))
  }

  return (
    <Select onValueChange={handleChange} value={value} required>
      <SelectTrigger className="w-full pl-5 h-10 border-none shadow-none py-0" disabled={disabled}>
        <SelectValue placeholder={placeholder ?? ""} />
      </SelectTrigger>
      <SelectContent className="p-0 border-none hover:border-none ">
        {/* {
          options && !loading &&
          <>
            <input className="flex w-full rounded-md bg-transparent py-2 px-3 text-sm outline-none" placeholder="Search..." onChange={(e) => handleFilterChange(e.target.value)} />
            <Separator />
          </>
        } */}
        {
          loading ?
            <div className="w-full py-10 flex items-center justify-center">
              <Spinner className="w-10 h-10 border-4" />
            </div>
            :
            !filteredOpts || filteredOpts?.length <= 0 ?
              <div className="w-full py-10 flex items-center justify-center">
                <p>No data.</p>
              </div>
              :
              <div className="mt-2 max-h-96 overflow-y-auto ">
                {
                  filteredOpts?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                }
              </div>
        }
      </SelectContent>
    </Select>
  )
})
SideBarEl.displayName = "SideBarEl"