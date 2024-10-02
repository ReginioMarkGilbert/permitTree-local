import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TimePicker({ className }) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const [period, setPeriod] = React.useState("AM")

    const handleTimeChange = (hours, minutes) => {
        let h = parseInt(hours)
        if (period === "PM" && h !== 12) {
            h += 12
        } else if (period === "AM" && h === 12) {
            h = 0
        }
        setValue(`${h.toString().padStart(2, "0")}:${minutes}`)
    }

    const displayValue = value ?
        `${(parseInt(value.split(':')[0]) % 12 || 12).toString().padStart(2, "0")}:${value.split(':')[1]} ${period}`
        : "Pick a time"

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {displayValue}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col space-y-2 p-2">
                    <div className="flex space-x-2">
                        <div>
                            <Label htmlFor="hours">Hours</Label>
                            <Input
                                id="hours"
                                className="w-[60px]"
                                type="number"
                                min={1}
                                max={12}
                                onChange={(e) => handleTimeChange(e.target.value, value.split(':')[1] || "00")}
                            />
                        </div>
                        <div>
                            <Label htmlFor="minutes">Minutes</Label>
                            <Input
                                id="minutes"
                                className="w-[60px]"
                                type="number"
                                min={0}
                                max={59}
                                onChange={(e) => handleTimeChange(value.split(':')[0] || "12", e.target.value.padStart(2, "0"))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="period">AM/PM</Label>
                            <Select value={period} onValueChange={(newPeriod) => {
                                setPeriod(newPeriod)
                                if (value) {
                                    handleTimeChange(value.split(':')[0], value.split(':')[1])
                                }
                            }}>
                                <SelectTrigger className="w-[70px]">
                                    <SelectValue>{period}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
