import React from 'react';
import { getUserRoles } from '../../utils/auth';
import NotificationList from '../../components/notifications/NotificationList';
import { useNotifications } from './hooks/useNotifications';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bell, BellRing, BellOff } from 'lucide-react';

const PersonnelNotificationPage = () => {
  const userRoles = getUserRoles();
  const {
    notifications,
    unreadNotifications,
    loading,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const filterNotificationsByRole = (notifications, roles) => {
    if (!notifications) return [];

    const roleNotificationMap = {
      'Technical_Staff': ['APPLICATION_NEEDS_REVIEW', 'APPLICATION_FOR_INSPECTION'],
      'Receiving_Clerk': ['APPLICATION_WITH_RECEIVING_CLERK'],
      'Chief_RPS': ['APPLICATION_WITH_CHIEF', 'OOP_NEEDS_SIGNATURE'],
      'Accountant': ['OOP_NEEDS_APPROVAL'],
      'Bill_Collector': ['PAYMENT_PROOF_SUBMITTED'],
      'PENR_CENR_Officer': ['APPLICATION_WITH_PENRCENR']
    };

    const relevantTypes = roles.flatMap(role => roleNotificationMap[role] || []);
    return notifications.filter(notification => relevantTypes.includes(notification.type));
  };

  const roleSpecificNotifications = filterNotificationsByRole(notifications, userRoles);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <BellRing className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Notifications</h1>
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

      <Card className="border-none shadow-lg">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" className="relative">
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
            <TabsTrigger value="unread" className="relative">
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
            <TabsTrigger value="role" className="relative">
              <span className="flex items-center gap-2">
                <BellOff className="h-4 w-4" />
                Role Specific
                {roleSpecificNotifications?.length > 0 && (
                  <Badge variant="secondary">
                    {roleSpecificNotifications.length}
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

          <TabsContent value="role">
            <NotificationList
              notifications={roleSpecificNotifications}
              loading={loading}
              onMarkAsRead={markAsRead}
              roleSpecific
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default PersonnelNotificationPage;
