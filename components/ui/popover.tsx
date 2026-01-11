"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode
}

const Popover = ({ children }: PopoverProps) => {
  return <div className="relative">{children}</div>
}

interface PopoverTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

const PopoverTrigger = ({ children, asChild }: PopoverTriggerProps) => {
  return <>{children}</>
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  align?: "center" | "start" | "end"
  sideOffset?: number
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, children, align = "center", sideOffset = 4, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 w-72 rounded-md border bg-white p-4 text-gray-900 shadow-md outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }