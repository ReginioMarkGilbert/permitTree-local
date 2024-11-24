import React, { useState, useMemo } from 'react';
import NotificationList from '@/components/notifications/NotificationList';
import NotificationsLayout from '@/components/notifications/NotificationsLayout';
import { useUserNotifications } from './hooks/useUserNotifications';
import { TabsContent } from '@/components/ui/tabs';
import { Bell, BellRing, FileText, CreditCard } from 'lucide-react';

const UserNotificationsPage = () => {
   const [searchQuery, setSearchQuery] = useState('');
   const {
      notifications,
      unreadNotifications,
      loading,
      markAsRead,
      markAllAsRead
   } = useUserNotifications();

   // Filter notifications based on search query
   const filterNotifications = (notifs) => {
      if (!searchQuery.trim()) return notifs;

      const query = searchQuery.toLowerCase();
      return notifs?.filter(notification =>
         notification.message.toLowerCase().includes(query) ||
         notification.type.toLowerCase().includes(query)
      );
   };

   // Memoize filtered notifications
   const filteredNotifications = useMemo(() =>
      filterNotifications(notifications), [notifications, searchQuery]
   );

   const filteredUnreadNotifications = useMemo(() =>
      filterNotifications(unreadNotifications), [unreadNotifications, searchQuery]
   );

   const filteredApplicationNotifications = useMemo(() =>
      filterNotifications(notifications?.filter(n =>
         n.type.startsWith('APPLICATION_') || n.type.startsWith('PERMIT_')
      )), [notifications, searchQuery]
   );

   const filteredPaymentNotifications = useMemo(() =>
      filterNotifications(notifications?.filter(n =>
         n.type.startsWith('OOP_') || n.type.startsWith('PAYMENT_') || n.type.startsWith('OR_')
      )), [notifications, searchQuery]
   );

   const tabs = [
      {
         value: 'all',
         icon: <Bell className="h-4 w-4" />,
         label: 'All',
         count: filteredNotifications?.length,
         content: filteredNotifications
      },
      {
         value: 'unread',
         icon: <BellRing className="h-4 w-4" />,
         label: 'Unread',
         count: filteredUnreadNotifications?.length,
         content: filteredUnreadNotifications
      },
      {
         value: 'applications',
         icon: <FileText className="h-4 w-4" />,
         label: 'Applications',
         count: filteredApplicationNotifications?.length,
         content: filteredApplicationNotifications
      },
      {
         value: 'payments',
         icon: <CreditCard className="h-4 w-4" />,
         label: 'Payments',
         count: filteredPaymentNotifications?.length,
         content: filteredPaymentNotifications
      }
   ];

   return (
      <div className="h-full">
         <NotificationsLayout
            title="My Notifications"
            tabs={tabs}
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            loading={loading}
            markAllAsRead={markAllAsRead}
            className="h-full"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
         >
            {tabs.map(tab => (
               <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="mt-0 flex-1"
               >
                  <NotificationList
                     notifications={tab.content}
                     loading={loading}
                     onMarkAsRead={markAsRead}
                     unreadOnly={tab.value === 'unread'}
                  />
               </TabsContent>
            ))}
         </NotificationsLayout>
      </div>
   );
};

export default UserNotificationsPage;
