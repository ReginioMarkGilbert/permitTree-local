import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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
      <div className="space-y-2 p-4">
        {notifications.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <div
              onClick={() => !notification.read && onMarkAsRead(notification.id)}
              className={cn(
                "flex items-start justify-between p-4 rounded-lg transition-all duration-200 transform",
                notification.read
                  ? "bg-background hover:bg-muted/30"
                  : "bg-muted hover:bg-muted/80 cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{notification.title}</h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      "transition-colors",
                      !notification.read && "bg-primary/10 hover:bg-primary/20"
                    )}
                  >
                    {notification.type}
                  </Badge>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              {notification.read ? (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-4" />
              ) : (
                <div className="w-4 h-4 flex-shrink-0 ml-4" />
              )}
            </div>
            {index < notifications.length - 1 && (
              <Separator className="my-2 bg-border/50" />
            )}
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationList;
