import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const NotificationsLayout = ({
   title,
   tabs,
   notifications,
   unreadNotifications,
   loading,
   markAllAsRead,
   children
}) => {
   const isMobile = useMediaQuery('(max-width: 640px)');

   if (loading) {
      return (
         <div className="container mx-auto px-4 sm:px-6 max-w-5xl pt-16 sm:pt-24 flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl pt-16 sm:pt-24">
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8 mt-8 sm:mt-0">
            <div className="flex items-center gap-3">
               <div className="relative">
                  <BellRing className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  {unreadNotifications?.length > 0 && (
                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                        font-medium px-1.5 py-0.5 rounded-full min-w-[20px] h-5
                        flex items-center justify-center">
                        {unreadNotifications.length}
                     </span>
                  )}
               </div>
               <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
            </div>
            {unreadNotifications?.length > 0 && (
               <button
                  onClick={markAllAsRead}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors
                     self-end sm:self-auto hover:underline focus:outline-none"
               >
                  Mark all as read
               </button>
            )}
         </div>

         <Card className="border-none shadow-lg min-h-[600px] sm:min-h-[800px] bg-white/50 backdrop-blur-sm p-4 sm:p-6">
            <Tabs defaultValue={tabs[0].value} className="w-full">
               <TabsList className="flex flex-wrap sm:grid sm:grid-cols-4 w-full gap-2 sm:gap-0 mb-6 p-1 bg-gray-100/80">
                  {tabs.map(tab => (
                     <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex-1 min-w-[120px] data-[state=active]:bg-white"
                     >
                        <span className="flex items-center gap-2 text-sm sm:text-base">
                           {!isMobile && tab.icon}
                           <span className={isMobile ? 'text-xs' : ''}>
                              {isMobile ? tab.label.split(' ')[0] : tab.label}
                           </span>
                           {tab.count > 0 && (
                              <Badge
                                 variant="secondary"
                                 className="text-xs px-2 py-0.5 min-w-[20px]"
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
   );
};

export default NotificationsLayout;
