import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, loading, onMarkAsRead }) => {
   return (
      <div className="space-y-4 h-[calc(7*7rem)] overflow-y-auto pr-2">
         {loading ? (
            <div className="flex justify-center items-center h-48">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
         ) : notifications?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
               <Bell className="h-12 w-12 mb-2" />
               <p>No notifications</p>
            </div>
         ) : (
            notifications?.map((notification) => (
               <div
                  key={notification.id}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                  className={cn(
                     "p-4 rounded-lg border transition-colors cursor-pointer",
                     !notification.read && "bg-muted/50 hover:bg-muted",
                     notification.read && "bg-background"
                  )}
               >
                  <NotificationItem notification={notification} />
               </div>
            ))
         )}
      </div>
   );
};

export default NotificationList;
