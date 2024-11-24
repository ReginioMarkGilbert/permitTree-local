import React, { useState, useMemo } from 'react';
import NotificationList from '@/components/notifications/NotificationList';
import NotificationsLayout from '@/components/notifications/NotificationsLayout';
import { usePersonnelNotifications } from './hooks/usePersonnelNotifications';
import { TabsContent } from '@/components/ui/tabs';
import { Bell, BellRing, ClipboardCheck, AlertCircle } from 'lucide-react';

const PersonnelNotificationsPage = () => {
   const [searchQuery, setSearchQuery] = useState('');
   const {
      notifications,
      unreadNotifications,
      loading,
      markAsRead,
      markAllAsRead
   } = usePersonnelNotifications();

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

   const filteredPendingReviewNotifications = useMemo(() =>
      filterNotifications(notifications?.filter(n =>
         n.type.includes('PENDING_') || n.type.includes('NEEDS_REVIEW')
      )), [notifications, searchQuery]
   );

   const filteredActionRequiredNotifications = useMemo(() =>
      filterNotifications(notifications?.filter(n =>
         n.metadata?.actionRequired && !n.read
      )), [notifications, searchQuery]
   );

   const filteredUnreadNotifications = useMemo(() =>
      filterNotifications(unreadNotifications), [unreadNotifications, searchQuery]
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
         value: 'pending',
         icon: <ClipboardCheck className="h-4 w-4" />,
         label: 'Pending Review',
         count: filteredPendingReviewNotifications?.length,
         content: filteredPendingReviewNotifications
      },
      {
         value: 'action',
         icon: <AlertCircle className="h-4 w-4" />,
         label: 'Action Required',
         count: filteredActionRequiredNotifications?.length,
         content: filteredActionRequiredNotifications
      },
      {
         value: 'unread',
         icon: <BellRing className="h-4 w-4" />,
         label: 'Unread',
         count: filteredUnreadNotifications?.length,
         content: filteredUnreadNotifications
      }
   ];

   return (
      <div className="h-full">
         <NotificationsLayout
            title="Personnel Notifications"
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

export default PersonnelNotificationsPage;
