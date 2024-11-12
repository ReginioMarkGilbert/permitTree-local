import React from 'react';
import NotificationList from '../../components/notifications/NotificationList';
import { usePersonnelNotifications } from './hooks/usePersonnelNotifications';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bell, BellRing, ClipboardCheck, CreditCard } from 'lucide-react';

const PersonnelNotificationsPage = () => {
   const {
      notifications,
      unreadNotifications,
      loading,
      markAsRead,
      markAllAsRead
   } = usePersonnelNotifications();

   const pendingReviewNotifications = notifications?.filter(n =>
      n.type.includes('PENDING_') || n.type.includes('NEEDS_REVIEW')
   );

   const actionRequiredNotifications = notifications?.filter(n =>
      n.metadata?.actionRequired && !n.read
   );

   return (
      <div className="container mx-auto p-6 max-w-5xl">
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
               <BellRing className="h-8 w-8 text-primary" />
               <h1 className="text-3xl font-bold">Personnel Notifications</h1>
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

         <Card className="border-none shadow-lg min-h-[800px]">
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
                  <TabsTrigger value="pending">
                     <span className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        Pending Review
                        {pendingReviewNotifications?.length > 0 && (
                           <Badge variant="secondary">
                              {pendingReviewNotifications.length}
                           </Badge>
                        )}
                     </span>
                  </TabsTrigger>
                  <TabsTrigger value="action">
                     <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Action Required
                        {actionRequiredNotifications?.length > 0 && (
                           <Badge variant="secondary">
                              {actionRequiredNotifications.length}
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
               </TabsList>

               <TabsContent value="all">
                  <NotificationList
                     notifications={notifications}
                     loading={loading}
                     onMarkAsRead={markAsRead}
                  />
               </TabsContent>

               <TabsContent value="pending">
                  <NotificationList
                     notifications={pendingReviewNotifications}
                     loading={loading}
                     onMarkAsRead={markAsRead}
                  />
               </TabsContent>

               <TabsContent value="action">
                  <NotificationList
                     notifications={actionRequiredNotifications}
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
            </Tabs>
         </Card>
      </div>
   );
};

export default PersonnelNotificationsPage;
