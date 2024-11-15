import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

const OOPFilters = ({ filters, setFilters }) => {
   const applicationTypes = [
      { value: "all", label: "All Types" },
      { value: "Chainsaw Registration", label: "Chainsaw Registration" },
      { value: "Certificate of Verification", label: "Certificate of Verification" },
      { value: "Private Tree Plantation Registration", label: "Private Tree Plantation Registration" },
      { value: "Public Land Tree Cutting Permit", label: "Public Land Tree Cutting Permit" },
      { value: "Private Land Timber Permit", label: "Private Land Timber Permit" },
      { value: "Tree Cutting and/or Earth Balling Permit", label: "Tree Cutting/Earth Balling Permit" }
   ];

   const amountRanges = [
      { value: "all", label: "All Amounts" },
      { value: "0-1000", label: "₱0 - ₱1,000" },
      { value: "1001-5000", label: "₱1,001 - ₱5,000" },
      { value: "5001-10000", label: "₱5,001 - ₱10,000" },
      { value: "10001+", label: "Above ₱10,000" }
   ];

   // Browser detection
   const isChrome = useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   // Application Type Select Component
   const ApplicationTypeSelect = () => {
      if (isChrome) {
         return (
            <select
               value={filters.applicationType}
               onChange={(e) => setFilters(prev => ({
                  ...prev,
                  applicationType: e.target.value === "all" ? "" : e.target.value
               }))}
               className="w-[200px] h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
               {applicationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                     {type.label}
                  </option>
               ))}
            </select>
         );
      }

      return (
         <Select
            value={filters.applicationType}
            onValueChange={(value) => setFilters(prev => ({
               ...prev,
               applicationType: value === "all" ? "" : value
            }))}
         >
            <SelectTrigger className="w-[200px]">
               <SelectValue placeholder="Nature of Application" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" className="w-[200px]">
               {applicationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                     {type.label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      );
   };

   // Amount Range Select Component
   const AmountRangeSelect = () => {
      if (isChrome) {
         return (
            <select
               value={filters.amountRange}
               onChange={(e) => setFilters(prev => ({
                  ...prev,
                  amountRange: e.target.value
               }))}
               className="w-[200px] h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
               {amountRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                     {range.label}
                  </option>
               ))}
            </select>
         );
      }

      return (
         <Select
            value={filters.amountRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, amountRange: value }))}
         >
            <SelectTrigger className="w-[200px]">
               <SelectValue placeholder="Amount Range" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" className="w-[200px]">
               {amountRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                     {range.label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      );
   };

   // Date Range Component
   const DateRangeComponent = () => {
      if (isChrome) {
         return (
            <div className="flex items-center space-x-2">
               <div className="flex items-center rounded-md border border-input">
                  <input
                     type="date"
                     value={filters.dateRange.from ? format(filters.dateRange.from, "yyyy-MM-dd") : ""}
                     onChange={(e) => {
                        const from = e.target.value ? new Date(e.target.value) : undefined;
                        setFilters(prev => ({
                           ...prev,
                           dateRange: { ...prev.dateRange, from }
                        }));
                     }}
                     className="h-10 px-3 py-2 rounded-md bg-background text-sm focus:outline-none"
                  />
               </div>
               <span className="text-sm text-muted-foreground">to</span>
               <div className="flex items-center rounded-md border border-input">
                  <input
                     type="date"
                     value={filters.dateRange.to ? format(filters.dateRange.to, "yyyy-MM-dd") : ""}
                     onChange={(e) => {
                        const to = e.target.value ? new Date(e.target.value) : undefined;
                        setFilters(prev => ({
                           ...prev,
                           dateRange: { ...prev.dateRange, to }
                        }));
                     }}
                     className="h-10 px-3 py-2 rounded-md bg-background text-sm focus:outline-none"
                  />
               </div>
            </div>
         );
      }

      return (
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
      );
   };

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
            <ApplicationTypeSelect />

            {/* Amount Range Filter */}
            <AmountRangeSelect />

            {/* Date Range Picker */}
            <DateRangeComponent />

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
