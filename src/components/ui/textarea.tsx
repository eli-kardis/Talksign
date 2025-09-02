import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "flex min-h-[80px] w-full rounded-[var(--radius)]",
          "border border-[var(--color-border)]",
          "bg-[var(--color-input-background)]",
          "px-3 py-2 text-sm",
          "text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:ring-[var(--color-destructive)]/20 aria-invalid:border-[var(--color-destructive)]",
          className
        )}
        {...props}
      />
    );
  }
)
Textarea.displayName = "Textarea"

export { Textarea };