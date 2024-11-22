import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

const CustomSelect = ({ options, onSelect, placeholder, value }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [selected, setSelected] = useState(() => options.find(opt => opt.value === value) || null);

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (isOpen && !event.target.closest('.custom-select-container')) {
            setIsOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [isOpen]);

   const handleSelect = (option) => {
      setSelected(option);
      onSelect(option.value);
      setIsOpen(false);
   };

   return (
      <div className="custom-select-container relative">
         <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
               "flex h-10 w-[200px] items-center justify-between rounded-md border border-input",
               "bg-white px-3 py-2 text-sm ring-offset-background",
               "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
               "disabled:cursor-not-allowed disabled:opacity-50",
               "hover:bg-accent hover:text-accent-foreground"
            )}
         >
            <span className="truncate text-sm text-left">
               {selected ? selected.label : placeholder}
            </span>
            <ChevronDown className={cn(
               "h-4 w-4 shrink-0 transition-transform duration-200",
               isOpen ? "rotate-180" : ""
            )} />
         </button>

         {isOpen && (
            <div className="absolute z-50 min-w-[200px] w-fit mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
               <div className="py-1 max-h-[300px] overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
                  {options.map((option) => (
                     <button
                        key={option.value}
                        type="button"
                        className={cn(
                           "relative w-full cursor-default text-sm outline-none text-left whitespace-nowrap",
                           "py-1.5 px-2",
                           "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                           "hover:bg-accent hover:text-accent-foreground",
                           "focus:bg-accent focus:text-accent-foreground",
                           selected?.value === option.value && "bg-accent/50 font-medium text-accent-foreground"
                        )}
                        onClick={() => handleSelect(option)}
                     >
                        <div className="mx-2">
                           <span className="block">{option.label}</span>
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};

export default CustomSelect; 
