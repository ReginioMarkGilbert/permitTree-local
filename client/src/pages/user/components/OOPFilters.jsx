import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const OOPFilters = ({ filters, setFilters }) => {
   return (
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
         {/* Search Bar */}
         <div className="relative w-full sm:w-1/3">
            <Input
               type="text"
               placeholder="Search by application or bill number..."
               value={filters.searchTerm}
               onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
               className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
         </div>

         {/* OOP-specific Filters */}
         <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
            {/* Nature of Application Filter */}
            <Select
               value={filters.applicationType}
               onValueChange={(value) => setFilters(prev => ({ ...prev, applicationType: value === "all" ? "" : value }))}
            >
               <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Nature of Application" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Chainsaw Registration">Chainsaw Registration</SelectItem>
                  <SelectItem value="Certificate of Verification">Certificate of Verification</SelectItem>
                  <SelectItem value="Private Tree Plantation Registration">Private Tree Plantation Registration</SelectItem>
                  <SelectItem value="Public Land Tree Cutting Permit">Public Land Tree Cutting Permit</SelectItem>
                  <SelectItem value="Private Land Timber Permit">Private Land Timber Permit</SelectItem>
                  <SelectItem value="Tree Cutting and/or Earth Balling Permit">Tree Cutting/Earth Balling Permit</SelectItem>
               </SelectContent>
            </Select>

            {/* Amount Range Filter */}
            <Select
               value={filters.amountRange}
               onValueChange={(value) => setFilters(prev => ({ ...prev, amountRange: value }))}
            >
               <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Amount Range" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="0-1000">₱0 - ₱1,000</SelectItem>
                  <SelectItem value="1001-5000">₱1,001 - ₱5,000</SelectItem>
                  <SelectItem value="5001-10000">₱5,001 - ₱10,000</SelectItem>
                  <SelectItem value="10001+">Above ₱10,000</SelectItem>
               </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <Popover>
               <PopoverTrigger asChild>
                  <Button
                     variant="outline"
                     className={`w-[200px] justify-start text-left font-normal ${
                        filters.dateRange.from ? 'text-foreground' : 'text-muted-foreground'
                     }`}
                  >
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                           <>
                              {format(filters.dateRange.from, "MM/dd/yyyy")} -{" "}
                              {format(filters.dateRange.to, "MM/dd/yyyy")}
                           </>
                        ) : (
                           format(filters.dateRange.from, "MM/dd/yyyy")
                        )
                     ) : (
                        <span>Select date range</span>
                     )}
                  </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                     initialFocus
                     mode="range"
                     selected={filters.dateRange}
                     onSelect={(range) =>
                        setFilters(prev => ({ ...prev, dateRange: range || { from: undefined, to: undefined } }))
                     }
                     numberOfMonths={2}
                  />
               </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            <Button
               variant="outline"
               onClick={() => setFilters({
                  searchTerm: '',
                  applicationType: '',
                  amountRange: '',
                  dateRange: { from: undefined, to: undefined }
               })}
               className="px-3"
            >
               Clear
            </Button>
         </div>
      </div>
   );
};

export default OOPFilters;