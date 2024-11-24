import { useState, useCallback } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const useSidebarToggle = () => {
   const isDesktop = useMediaQuery('(min-width: 1024px)');
   const [sidebarToggle, setSidebarToggle] = useState(isDesktop);

   const toggleSidebar = useCallback(() => {
      setSidebarToggle(prev => !prev);
   }, []);

   return { sidebarToggle, toggleSidebar };
};

export default useSidebarToggle;
