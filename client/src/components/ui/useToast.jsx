import { toast as toastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const toast = ({ title, description, variant }) => {
    toastify[variant || 'default'](`${title}: ${description}`);
};
