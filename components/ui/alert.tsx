import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-3 py-2.5 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        warning:
          "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900 *:data-[slot=alert-description]:text-amber-800 dark:*:data-[slot=alert-description]:text-amber-300 *:[svg]:text-amber-600 dark:*:[svg]:text-amber-400",
        destructive:
          "bg-red-50 dark:bg-red-950/30 text-destructive border-destructive/20 *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
        info:
          "bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-900 *:data-[slot=alert-description]:text-blue-800 dark:*:data-[slot=alert-description]:text-blue-300 *:[svg]:text-blue-600 dark:*:[svg]:text-blue-400",
        success:
          "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900 *:data-[slot=alert-description]:text-emerald-800 dark:*:data-[slot=alert-description]:text-emerald-300 *:[svg]:text-emerald-600 dark:*:[svg]:text-emerald-400",
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
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
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
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
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
