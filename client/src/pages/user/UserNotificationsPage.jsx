import React from 'react';
import NotificationList from '../../components/notifications/NotificationList';
import { useNotifications } from './hooks/useNotifications';
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
   } = useNotifications();

   const applicationNotifications = notifications?.filter(n =>
      n.type.startsWith('APPLICATION_') || n.type.startsWith('PERMIT_')
   );

   const paymentNotifications = notifications?.filter(n =>
      n.type.startsWith('OOP_') || n.type.startsWith('PAYMENT_') || n.type.startsWith('OR_')
   );

   return (
      <div className="container mx-auto p-6 max-w-5xl pt-24">
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
               <BellRing className="h-8 w-8 text-primary" />
               <h1 className="text-3xl font-bold">My Notifications</h1>
               {unreadNotifications?.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                     {unreadNotifications.length} new
                  </Badge>
               )}
            </div>
            {unreadNotifications?.length > 0 && (
               <button
                  onClick={markAllAsRead}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
               >
                  Mark all as read
               </button>
            )}
         </div>

         <Card className="border-none shadow-lg min-h-[1200px]">
            <Tabs defaultValue="all" className="w-full">
               <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="all">
                     <span className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        All
                        {notifications?.length > 0 && (
                           <Badge variant="secondary">
                              {notifications.length}
                           </Badge>
                        )}
                     </span>
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                     <span className="flex items-center gap-2">
                        <BellRing className="h-4 w-4" />
                        Unread
                        {unreadNotifications?.length > 0 && (
                           <Badge variant="secondary">
                              {unreadNotifications.length}
                           </Badge>
                        )}
                     </span>
                  </TabsTrigger>
                  <TabsTrigger value="applications">
                     Applications
                     {applicationNotifications?.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                           {applicationNotifications.length}
                        </Badge>
                     )}
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                     Payments
                     {paymentNotifications?.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                           {paymentNotifications.length}
                        </Badge>
                     )}
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
