import * as React from "react";
import { cn } from "@/lib/utils";

// Using type alias instead of empty interface to avoid TS warning
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "flex min-h-[80px] w-full rounded-lg",
          "border border-border",
          "bg-input-background",
          "px-3 py-2 text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    );
  }
)
Textarea.displayName = "Textarea"

export { Textarea };