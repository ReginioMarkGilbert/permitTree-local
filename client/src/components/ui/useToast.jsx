import { toast as toastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const toastVariants = {
    success: toastify.success,
    error: toastify.error,
    info: toastify.info,
    warning: toastify.warning,
    default: toastify
};

export const toast = ({ title, description, variant = 'default' }) => {
    const toastMethod = toastVariants[variant] || toastVariants.default;
    toastMethod(`${title}: ${description}`);
};
