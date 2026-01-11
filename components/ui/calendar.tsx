"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
  className?: string
}

const Calendar = ({
  mode = "single",
  selected,
  onSelect,
  initialFocus = false,
  className,
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = React.useState(selected || new Date())
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }
  
  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    onSelect?.(selectedDate)
  }
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  
  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {monthNames[month]} {year}
        </div>
        <button
          onClick={() => navigateMonth('next')}
          className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0")}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const isSelected = selected && 
            selected.getDate() === day && 
            selected.getMonth() === month && 
            selected.getFullYear() === year
          const isToday = new Date().getDate() === day && 
            new Date().getMonth() === month && 
            new Date().getFullYear() === year
          
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-9 w-9 p-0",
                isSelected && "bg-blue-600 text-white hover:bg-blue-700",
                !isSelected && isToday && "bg-gray-100",
                !isSelected && !isToday && "hover:bg-gray-100"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }