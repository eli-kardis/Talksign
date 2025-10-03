import * as React from "react"
import { cn } from "@/lib/utils"

// Using type alias instead of empty interface to avoid TS warning
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "flex h-10 w-full rounded-lg",
          "border border-border",
          "bg-input-background",
          "px-3 py-2 text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
