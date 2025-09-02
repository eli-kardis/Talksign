import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "flex h-10 w-full rounded-[var(--radius)]",
          "border border-[var(--color-border)]",
          "bg-[var(--color-input-background)]",
          "px-3 py-2 text-sm",
          "text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]",
          "file:border-0 file:bg-transparent file:text-[var(--color-foreground)] file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:ring-[var(--color-destructive)]/20 aria-invalid:border-[var(--color-destructive)]",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
