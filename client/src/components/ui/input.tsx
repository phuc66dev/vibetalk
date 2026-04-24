import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "w-full rounded-2xl border border-transparent bg-surface-lowest py-[0.9rem] px-4 text-text outline-none transition-all duration-200 focus:border-primary/36 focus:shadow-[0_0_0_3px_rgba(221,184,255,0.12)]",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }

