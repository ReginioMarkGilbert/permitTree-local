import React from 'react';
import NotificationList from '../../components/notifications/NotificationList';
import { useUserNotifications } from './hooks/useUserNotifications';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bell, BellRing } from 'lucide-react';

const UserNotificationsPage = () => {
   const {
      notifications,
      unreadNotifications,
      loading,
      markAsRead,
      markAllAsRead
   } = useUserNotifications();

   const applicationNotifications = notifications?.filter(n =>
      n.type.startsWith('APPLICATION_') || n.type.startsWith('PERMIT_')
   );

   const paymentNotifications = notifications?.filter(n =>
      n.type.startsWith('OOP_') || n.type.startsWith('PAYMENT_') || n.type.startsWith('OR_')
   );

   return (
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl pt-16 sm:pt-24">
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8 mt-8 sm:mt-0">
            <div className="flex items-center gap-3">
               <BellRing className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
               <h1 className="text-2xl sm:text-3xl font-bold">My Notifications</h1>
               {unreadNotifications?.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                     {unreadNotifications.length} new
                  </Badge>
               )}
            </div>
            {unreadNotifications?.length > 0 && (
               <button
                  onClick={markAllAsRead}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors self-end sm:self-auto"
               >
                  Mark all as read
               </button>
            )}
         </div>

         <Card className="border-none shadow-lg min-h-[600px] sm:min-h-[800px]">
            <Tabs defaultValue="all" className="w-full">
               <TabsList className="flex flex-wrap sm:grid sm:grid-cols-4 w-full gap-2 sm:gap-0 mb-4">
                  <TabsTrigger value="all" className="flex-1 min-w-[120px]">
                     <span className="flex items-center gap-2 text-sm sm:text-base">
                        <Bell className="h-4 w-4" />
                        All
                        {notifications?.length > 0 && (
                           <Badge variant="secondary" className="hidden sm:inline-flex">
                              {notifications.length}
                           </Badge>
                        )}
                     </span>
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1 min-w-[120px]">
                     <span className="flex items-center gap-2 text-sm sm:text-base">
                        <BellRing className="h-4 w-4" />
                        Unread
                        {unreadNotifications?.length > 0 && (
                           <Badge variant="secondary" className="hidden sm:inline-flex">
                              {unreadNotifications.length}
                           </Badge>
                        )}
                     </span>
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="flex-1 min-w-[120px]">
                     <span className="flex items-center gap-2 text-sm sm:text-base">
                        Applications
                        {applicationNotifications?.length > 0 && (
                           <Badge variant="secondary" className="hidden sm:inline-flex">
                              {applicationNotifications.length}
                           </Badge>
                        )}
                     </span>
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="flex-1 min-w-[120px]">
                     <span className="flex items-center gap-2 text-sm sm:text-base">
                        Payments
                        {paymentNotifications?.length > 0 && (
                           <Badge variant="secondary" className="hidden sm:inline-flex">
                              {paymentNotifications.length}
                           </Badge>
                        )}
                     </span>
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="all">
                  <NotificationList
                     notifications={notifications}
                     loading={loading}
                     onMarkAsRead={markAsRead}
                  />
               </TabsContent>

               <TabsContent value="unread">
                  <NotificationList
                     notifications={unreadNotifications}
                     loading={loading}
                     onMarkAsRead={markAsRead}
                     unreadOnly
                  />
               </TabsContent>

               <TabsContent value="applications">
                  <NotificationList
                     notifications={applicationNotifications}
                     loading={loading}
                     onMarkAsRead={markAsRead}
                  />
               </TabsContent>

               <TabsContent value="payments">
                  <NotificationList
                     notifications={paymentNotifications}
                     loading={loading}
                     onMarkAsRead={markAsRead}
                  />
               </TabsContent>
            </Tabs>
         </Card>
      </div>
   );
};

export default UserNotificationsPage;
