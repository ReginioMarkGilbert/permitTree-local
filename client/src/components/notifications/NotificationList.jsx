import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationList = ({
  notifications = [],
  loading,
  onMarkAsRead,
  unreadOnly,
  roleSpecific
}) => {
  if (loading) return <div className="p-4 text-center">Loading notifications...</div>;
  if (!notifications.length) return <div className="p-4 text-center">No notifications</div>;

  return (
    <ScrollArea className="h-[500px] w-full">
      <div className="space-y-4 p-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-start justify-between p-4 rounded-lg",
              notification.read ? "bg-background" : "bg-muted"
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{notification.title}</h4>
                <Badge variant="outline">{notification.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkAsRead(notification.id)}
            >
              {notification.read ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationList;
