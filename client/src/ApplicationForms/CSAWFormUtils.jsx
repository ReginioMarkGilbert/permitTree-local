import React, { useState, useRef, useEffect } from 'react';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Download, X, CalendarIcon } from "lucide-react";
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { format, parseISO, isValid } from "date-fns";

export const CheckboxItem = ({ id, label, checked, onChange }) => (
    <div className="flex items-center">
        <input
            type="checkbox"
            id={id}
            name={id}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
            {label}
        </label>
    </div>
);

export const UploadCard = ({ label, documentLabel, files, onFileChange, onRemoveFile }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </span>
                <span className="font-medium">{label}</span>
            </div>
            <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{documentLabel}</label>
                <div className="space-y-4">
                    <div className="mb-6">
                        <div className="flex flex-col gap-4">
                            <label
                                htmlFor={`file-upload-${label}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer w-fit"
                            >
                                <Download className="h-4 w-4" />
                                Choose Files
                            </label>
                            <input
                                id={`file-upload-${label}`}
                                type="file"
                                className="hidden"
                                onChange={onFileChange}
                                multiple
                                accept=".png,.jpg,.jpeg,.pdf,.docx"
                            />
                            {files.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                                            <span className="text-sm text-gray-600 truncate">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveFile(file)}
                                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {files.length === 0 && (
                                <p className="text-sm text-gray-500">No files chosen</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CustomSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [width, setWidth] = useState('auto');
    const selectRef = useRef(null);
    const measureRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (measureRef.current) {
            const longestOption = options.reduce((a, b) => a.label.length > b.label.length ? a : b);
            measureRef.current.textContent = longestOption.label;
            const width = measureRef.current.offsetWidth;
            setWidth(`${width + 40}px`); // Add some padding
        }
    }, [options]);

    return (
        <div ref={selectRef} className="relative" style={{ width }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
                {value ? options.find(opt => opt.value === value)?.label : "Select a store"}
                <ChevronDownIcon className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover rounded-md border shadow-md">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                        >
                            {option.label}
                            {value === option.value && (
                                <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                                    <CheckIcon className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <span ref={measureRef} className="absolute opacity-0 pointer-events-none whitespace-nowrap" />
        </div>
    );
};

export const CustomDatePicker = ({ selectedDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(selectedDate ? parseISO(selectedDate) : new Date());
    const datePickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (isValid(newDate)) {
            onChange(newDate.toISOString());
            setIsOpen(false);
        } else {
            console.error('Invalid date selected');
            // Optionally, show an error message to the user
        }
    };

    const renderCalendar = () => {
        const days = daysInMonth(currentMonth);
        const firstDay = firstDayOfMonth(currentMonth);
        const calendarDays = [];

        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        for (let day = 1; day <= days; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            calendarDays.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isSelected ? 'bg-green-600 text-white' : 'hover:bg-gray-200'
                        }`}
                >
                    {day}
                </button>
            );
        }

        return calendarDays;
    };

    return (
        <div ref={datePickerRef} className="relative">
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-start text-left font-normal"
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(parseISO(selectedDate), "PPP") : <span>Pick a date</span>}
            </Button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-64 bg-white border rounded-md shadow-lg">
                    <div className="flex justify-between items-center p-2 border-b">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <span>{format(currentMonth, "MMMM yyyy")}</span>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 p-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500">{day}</div>
                        ))}
                        {renderCalendar()}
                    </div>
                </div>
            )}
        </div>
    );
};

export const formatLabel = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lower and upper case letters
        .replace(/\b(P L T P R|W P P)\b/g, match => match.replace(/ /g, '')); // Remove spaces in PLTPR and WPP
};

export const formatReviewValue = (key, value) => {
    if (key === 'dateOfAcquisition' && value) {
        return format(parseISO(value), 'MMMM d, yyyy');
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    return value;
};
