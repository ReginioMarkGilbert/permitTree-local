"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange({ className, date, setDate }) {
  // Browser detection
  const isChrome = React.useMemo(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isBrave = navigator.brave !== undefined;
    return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
  }, []);

  const formatDateRange = (date) => {
    if (!date?.from) return "Select dates";
    if (!date?.to) return format(date.from, "MM/dd/yyyy");
    return `${format(date.from, "MM/dd/yyyy")} - ${format(date.to, "MM/dd/yyyy")}`;
  };

  if (isChrome) {
    return (
      <div className="flex items-center space-x-2 w-[280px]">
        <div className="flex items-center rounded-md border border-input">
          <input
            type="date"
            value={date?.from ? format(date.from, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const from = e.target.value ? new Date(e.target.value) : undefined;
              setDate(prev => ({
                ...prev,
                from
              }));
            }}
            className="h-10 px-2 py-2 rounded-md bg-background text-sm focus:outline-none w-[130px]"
          />
        </div>
        <span className="text-sm text-muted-foreground">-</span>
        <div className="flex items-center rounded-md border border-input">
          <input
            type="date"
            value={date?.to ? format(date.to, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const to = e.target.value ? new Date(e.target.value) : undefined;
              setDate(prev => ({
                ...prev,
                to
              }));
            }}
            className="h-10 px-2 py-2 rounded-md bg-background text-sm focus:outline-none w-[130px]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) =>
              setDate(range || { from: undefined, to: undefined })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
