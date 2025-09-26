import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
  "peer inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-slate-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 "+
  "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-cyan-500 data-[state=checked]:border-emerald-600 data-[state=checked]:shadow-lg data-[state=checked]:shadow-emerald-400/40 "+
  "data-[state=unchecked]:bg-slate-600 data-[state=unchecked]:border-slate-500",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-xl ring-0 border-2 border-slate-300 transition-transform duration-200 "+
        "data-[state=checked]:translate-x-7 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-400 data-[state=checked]:shadow-emerald-400/40 " +
        "data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-slate-200 data-[state=unchecked]:border-slate-400"
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }