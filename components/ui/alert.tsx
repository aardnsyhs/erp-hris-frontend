import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-md border px-3 py-2.5 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground border-border",
        warning:
          "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/30 *:data-[slot=alert-description]:text-[var(--status-warning)]/90 *:[svg]:text-[var(--status-warning)]",
        destructive:
          "bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/30 *:data-[slot=alert-description]:text-[var(--status-danger)]/90 *:[svg]:text-[var(--status-danger)]",
        info:
          "bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info)]/30 *:data-[slot=alert-description]:text-[var(--status-info)]/90 *:[svg]:text-[var(--status-info)]",
        success:
          "bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/30 *:data-[slot=alert-description]:text-[var(--status-success)]/90 *:[svg]:text-[var(--status-success)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-semibold text-xs group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-xs text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
