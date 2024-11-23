import React from 'react';
import NotificationList from '@/components/notifications/NotificationList';
import NotificationsLayout from '@/components/notifications/NotificationsLayout';
import { usePersonnelNotifications } from './hooks/usePersonnelNotifications';
import { TabsContent } from '@/components/ui/tabs';
import { Bell, BellRing, ClipboardCheck, AlertCircle } from 'lucide-react';

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

   const tabs = [
      {
         value: 'all',
         icon: <Bell className="h-4 w-4" />,
         label: 'All',
         count: notifications?.length,
         content: notifications
      },
      {
         value: 'pending',
         icon: <ClipboardCheck className="h-4 w-4" />,
         label: 'Pending Review',
         count: pendingReviewNotifications?.length,
         content: pendingReviewNotifications
      },
      {
         value: 'action',
         icon: <AlertCircle className="h-4 w-4" />,
         label: 'Action Required',
         count: actionRequiredNotifications?.length,
         content: actionRequiredNotifications
      },
      {
         value: 'unread',
         icon: <BellRing className="h-4 w-4" />,
         label: 'Unread',
         count: unreadNotifications?.length,
         content: unreadNotifications
      }
   ];

   return (
      <NotificationsLayout
         title="Personnel Notifications"
         tabs={tabs}
         notifications={notifications}
         unreadNotifications={unreadNotifications}
         loading={loading}
         markAllAsRead={markAllAsRead}
      >
         {tabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
               <NotificationList
                  notifications={tab.content}
                  loading={loading}
                  onMarkAsRead={markAsRead}
                  unreadOnly={tab.value === 'unread'}
               />
            </TabsContent>
         ))}
      </NotificationsLayout>
   );
};

export default PersonnelNotificationsPage;
