import React from 'react';
import { FaBars, FaTimes, FaLeaf } from 'react-icons/fa';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navbar = ({ sidebarToggle, setSidebarToggle }) => {
   const handleToggle = () => {
      setSidebarToggle(!sidebarToggle);
   };

   return (
      <nav className="fixed top-0 left-0 right-0 z-20 bg-background border-b shadow-sm">
         <div className="max-w-[2520px] mx-auto flex justify-between items-center px-4 h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
               <button
                  onClick={handleToggle}
                  className="text-foreground hover:text-green-700 p-2 rounded-lg
                            hover:bg-accent transition-colors duration-200 flex items-center justify-center"
                  aria-label="Toggle Sidebar"
               >
                  <div className="relative w-5 h-5">
                     <FaBars
                        size={20}
                        className={`absolute transition-all duration-200
                                    ${sidebarToggle ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
                     />
                     <FaTimes
                        size={20}
                        className={`absolute transition-all duration-200
                                    ${sidebarToggle ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                     />
                  </div>
               </button>
               <div className="flex items-center gap-3">
                  <FaLeaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-xl font-bold bg-gradient-to-r from-green-800 to-green-600 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
                     PermitTree
                  </span>
               </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
               <ThemeToggle />
               <div className="text-sm font-medium text-foreground">
                  DENR Region 4B
               </div>
            </div>
         </div>
      </nav>
   );
};

export default Navbar;
