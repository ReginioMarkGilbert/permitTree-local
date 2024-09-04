import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useSidebarToggle = () => {
    const [sidebarToggle, setSidebarToggle] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setSidebarToggle(false);
    }, [location]);

    const toggleSidebar = () => setSidebarToggle(!sidebarToggle);

    return { sidebarToggle, toggleSidebar };
};

export default useSidebarToggle;
