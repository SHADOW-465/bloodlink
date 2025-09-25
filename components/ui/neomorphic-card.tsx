import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

const NeomorphicCard = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("neomorphic rounded-2xl bg-card text-card-foreground p-6 transition-all duration-300", className)}
      {...props}
    />
  ),
)
NeomorphicCard.displayName = "NeomorphicCard"

const NeomorphicCardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-6", className)} {...props} />
  ),
)
NeomorphicCardHeader.displayName = "NeomorphicCardHeader"

const NeomorphicCardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight text-balance", className)}
      {...props}
    />
  ),
)
NeomorphicCardTitle.displayName = "NeomorphicCardTitle"

const NeomorphicCardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground text-pretty", className)} {...props} />
  ),
)
NeomorphicCardDescription.displayName = "NeomorphicCardDescription"

const NeomorphicCardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("", className)} {...props} />,
)
NeomorphicCardContent.displayName = "NeomorphicCardContent"

export { NeomorphicCard, NeomorphicCardHeader, NeomorphicCardTitle, NeomorphicCardDescription, NeomorphicCardContent }
