import * as React from "react"
import { cn } from "@/lib/utils"

export interface NeomorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const NeomorphicInput = React.forwardRef<HTMLInputElement, NeomorphicInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "neomorphic-inset flex h-12 w-full rounded-xl bg-background px-4 py-3 text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
NeomorphicInput.displayName = "NeomorphicInput"

export { NeomorphicInput }
