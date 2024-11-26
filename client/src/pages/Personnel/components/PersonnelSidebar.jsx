import React, { useCallback, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { removeToken } from '@/utils/tokenManager';
import { isAuthenticated, getUserRoles } from '@/utils/auth';
import { gql, useMutation } from '@apollo/client';
import {
   Home,
   LayoutDashboard,
   CalendarCheck,
   Receipt,
   Bell,
   BarChart,
   Map,
   Settings,
   LogOut,
   ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import permitTreeLogo from '@/assets/denr-logo.png';
import {
   Sheet,
   SheetContent,
} from "@/components/ui/sheet";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const PersonnelSidebar = React.memo(({ isOpen, onToggle }) => {
   const navigate = useNavigate();
   const location = useLocation();
   const [logout] = useMutation(LOGOUT_MUTATION);
   const userRoles = getUserRoles();
   const [isAuth, setIsAuth] = useState(isAuthenticated());

   const handleLogout = useCallback(async () => {
      try {
         await logout();
         removeToken();
         localStorage.removeItem('user');
         setIsAuth(false);
         if (isOpen) onToggle();
         navigate('/auth');
      } catch (error) {
         console.error('Logout failed:', error);
      }
   }, [logout, navigate, isOpen, onToggle]);

   useEffect(() => {
      const authStatus = isAuthenticated();
      setIsAuth(authStatus);
      if (!authStatus) {
         if (isOpen) onToggle();
         navigate('/auth');
      }
   }, [navigate, isOpen, onToggle]);

   const getDashboardLink = () => {
      const roleLinks = {
         'Receiving_Clerk': "/personnel/receiving-releasing",
         'Releasing_Clerk': "/personnel/receiving-releasing",
         'Technical_Staff': "/personnel/technical-staff",
         'Chief_RPS': "/personnel/chief",
         'Chief_TSD': "/personnel/chief",
         'Accountant': "/personnel/accountant",
         'OOP_Staff_Incharge': "/personnel/accountant",
         'Bill_Collector': "/personnel/bill-collector",
         'Credit_Officer': "/personnel/bill-collector",
         'PENR_CENR_Officer': "/personnel/penr-cenr-officer",
         'Deputy_CENR_Officer': "/personnel/penr-cenr-officer",
         'Inspection_Team': "/personnel/inspection-team"
      };

      return userRoles.reduce((link, role) => roleLinks[role] || link, "/personnel/dashboard");
   };

   const shouldShowOrderOfPayment = () => {
      return userRoles.includes('Chief_RPS') || userRoles.includes('Chief_TSD');
   };

   const mainNavItems = [
      { to: "/personnel/home", icon: Home, text: "Home" },
      { to: getDashboardLink(), icon: LayoutDashboard, text: "Dashboard" },
      ...(userRoles.includes('Technical_Staff') ? [
         { to: "/personnel/inspection-scheduling", icon: CalendarCheck, text: "Inspection Schedule" }
      ] : []),
      ...(shouldShowOrderOfPayment() ? [
         { to: "/personnel/order-of-payment", icon: Receipt, text: "Order of Payment" }
      ] : []),
      { to: "/personnel/notifications", icon: Bell, text: "Notifications" },
      { to: "/personnel/reports", icon: BarChart, text: "Reports" },
      { to: "/gis", icon: Map, text: "GIS Maps" },
   ];

   const accountNavItems = [
      { to: "/personnel/settings", icon: Settings, text: "Settings" },
      { to: "/auth", icon: LogOut, text: "Logout", onClick: handleLogout }
   ];

   const SidebarItem = ({ item, isCollapsed }) => {
      const isActive = location.pathname === item.to;
      const content = (
         <NavLink
            to={item.to}
            onClick={item.onClick}
            className={cn(
               "relative flex h-10 w-full items-center",
               "hover:bg-accent rounded-lg transition-colors",
               "px-3"
            )}
         >
            <div className="flex items-center w-full">
               <div className="w-[24px] flex items-center justify-center">
                  <item.icon className={cn(
                     "h-4 w-4",
                     isActive ? "text-accent-foreground" : "text-muted-foreground"
                  )} />
               </div>
               <span className={cn(
                  "ml-2 text-[15px] absolute left-[48px]",
                  "transition-all duration-300",
                  isCollapsed ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0",
                  isActive ? "text-accent-foreground" : "text-muted-foreground"
               )}>
                  {item.text}
               </span>
            </div>
         </NavLink>
      );

      if (isCollapsed) {
         return (
            <TooltipProvider delayDuration={0}>
               <Tooltip>
                  <TooltipTrigger asChild>
                     {content}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center">
                     {item.text}
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      return content;
   };

   const SidebarContent = ({ isCollapsed = false }) => (
      <div className="flex h-full flex-col">
         <div className={cn(
            "flex h-[12px] items-center",
            isCollapsed ? "justify-center" : "px-4"
         )}>
            <NavLink to="/personnel/home" className="flex items-center gap-2"> </NavLink>
         </div>
         <ScrollArea className="flex-1">
            <div className="space-y-1 px-2 pt-1 font-medium">
               {mainNavItems.map((item, i) => (
                  <SidebarItem key={i} item={item} isCollapsed={isCollapsed} />
               ))}
            </div>
         </ScrollArea>
         <div className={cn(
            "mt-auto border-t px-2 py-2"
         )}>
            {accountNavItems.map((item, i) => (
               <SidebarItem key={i} item={item} isCollapsed={isCollapsed} />
            ))}
         </div>
         <Button
            variant="ghost"
            className={cn(
               "h-10 w-full border-t",
               isCollapsed ? "px-2" : "px-4"
            )}
            onClick={onToggle}
         >
            <ChevronLeft className={cn(
               "h-4 w-4 transition-all",
               isOpen ? "rotate-0" : "rotate-180"
            )} />
         </Button>
      </div>
   );

   // Add useEffect to handle window resize
   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth < 1024);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   // Update the render logic
   if (isMobile) {
      return (
         <Sheet open={isOpen} onOpenChange={onToggle}>
            <SheetContent side="left" className="p-0 w-[270px] flex flex-col">
               <div className="h-16 border-b flex items-center px-6">
                  <h2 className="text-lg font-semibold">Menu</h2>
               </div>
               <div className="flex-1 overflow-auto">
                  <SidebarContent />
               </div>
            </SheetContent>
         </Sheet>
      );
   }

   return (
      <div className={cn(
         "fixed top-16 left-0 z-30 h-[calc(100%-4rem)] border-r bg-background",
         isOpen ? "w-[270px]" : "w-[64px]",
         "transition-[width] duration-300 ease-in-out"
      )}>
         <SidebarContent isCollapsed={!isOpen} />
      </div>
   );
});

export default PersonnelSidebar;
