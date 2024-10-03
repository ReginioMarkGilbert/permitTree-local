import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatLabel = (key: string): string => {
  return key.split(/(?=[A-Z])/).join(" ").replace(/^./, str => str.toUpperCase());
};

export const formatReviewValue = (key: string, value: any): string => {
  if (value === null || value === undefined) {
    return 'Not provided';
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None';
  }
  return value.toString();
};
