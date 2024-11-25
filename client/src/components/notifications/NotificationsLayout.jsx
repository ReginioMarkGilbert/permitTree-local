import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import NotificationSearch from './NotificationSearch';

const NotificationsLayout = ({
   title,
   tabs,
   notifications,
   unreadNotifications,
   loading,
   markAllAsRead,
   children,
   searchQuery,
   onSearchChange
}) => {
   const isMobile = useMediaQuery('(max-width: 640px)');

   if (loading) {
      return (
         <div className="container mx-auto px-4 sm:px-6 max-w-5xl pt-16 sm:pt-24 flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
         <div className="container mx-auto px-4 sm:px-6 max-w-5xl pt-16 sm:pt-24">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8 mt-8 sm:mt-0">
               <div className="flex items-center gap-3">
                  <div className="relative">
                     <BellRing className="h-6 w-6 sm:h-8 sm:w-8 text-primary dark:text-green-400" />
                     {unreadNotifications?.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                           font-medium px-1.5 py-0.5 rounded-full min-w-[20px] h-5
                           flex items-center justify-center">
                           {unreadNotifications.length}
                        </span>
                     )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
               </div>
               {unreadNotifications?.length > 0 && (
                  <button
                     onClick={markAllAsRead}
                     className="text-sm text-muted-foreground hover:text-primary dark:text-gray-300 dark:hover:text-green-400 transition-colors
                        self-end sm:self-auto hover:underline focus:outline-none"
                  >
                     Mark all as read
                  </button>
               )}
            </div>

            <div className="mb-6">
               <NotificationSearch
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
               />
            </div>

            <Card className="border-none shadow-lg min-h-[600px] sm:min-h-[800px] bg-white/50 dark:bg-black backdrop-blur-sm p-4 sm:p-6">
               <Tabs defaultValue={tabs[0].value} className="w-full space-y-6">
                  <TabsList className="h-12 p-1 w-full bg-muted/50 dark:bg-gray-800">
                     {tabs.map(tab => (
                        <TabsTrigger
                           key={tab.value}
                           value={tab.value}
                           className="flex-1 min-w-[120px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 dark:text-gray-200"
                        >
                           <span className="flex items-center gap-2 text-sm sm:text-base">
                              {!isMobile && tab.icon}
                              <span className={isMobile ? 'text-xs' : ''}>
                                 {isMobile ? tab.label.split(' ')[0] : tab.label}
                              </span>
                              {tab.count > 0 && (
                                 <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5 min-w-[20px] dark:bg-gray-800"
                                 >
                                    {tab.count}
                                 </Badge>
                              )}
                           </span>
                        </TabsTrigger>
                     ))}
                  </TabsList>
                  {children}
               </Tabs>
            </Card>
         </div>
      </div>
   );
};

export default NotificationsLayout;
