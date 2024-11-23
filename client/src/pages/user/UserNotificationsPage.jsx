import React from 'react';
import NotificationList from '@/components/notifications/NotificationList';
import NotificationsLayout from '@/components/notifications/NotificationsLayout';
import { useUserNotifications } from './hooks/useUserNotifications';
import { TabsContent } from '@/components/ui/tabs';
import { Bell, BellRing, FileText, CreditCard } from 'lucide-react';

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

   const tabs = [
      {
         value: 'all',
         icon: <Bell className="h-4 w-4" />,
         label: 'All',
         count: notifications?.length,
         content: notifications
      },
      {
         value: 'unread',
         icon: <BellRing className="h-4 w-4" />,
         label: 'Unread',
         count: unreadNotifications?.length,
         content: unreadNotifications
      },
      {
         value: 'applications',
         icon: <FileText className="h-4 w-4" />,
         label: 'Applications',
         count: applicationNotifications?.length,
         content: applicationNotifications
      },
      {
         value: 'payments',
         icon: <CreditCard className="h-4 w-4" />,
         label: 'Payments',
         count: paymentNotifications?.length,
         content: paymentNotifications
      }
   ];

   return (
      <NotificationsLayout
         title="My Notifications"
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

export default UserNotificationsPage;
