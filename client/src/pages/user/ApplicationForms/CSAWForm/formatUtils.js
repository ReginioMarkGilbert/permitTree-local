import { format, parseISO } from "date-fns";

const formatLabel = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lower and upper case letters
        .replace(/\b(P L T P R|W P P)\b/g, match => match.replace(/ /g, '')); // Remove spaces in PTPR and WPP
};

const formatReviewValue = (key, value) => {
    if (key === 'dateOfAcquisition' && value) {
        return format(parseISO(value), 'MMMM d, yyyy');
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    return value;
};

export { formatLabel, formatReviewValue };
