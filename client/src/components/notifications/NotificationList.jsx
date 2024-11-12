import React from 'react';
import { format } from 'date-fns';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationList = ({ notifications = [], loading, onMarkAsRead, unreadOnly }) => {
   if (loading) {
      return (
         <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      );
   }

   if (!notifications.length) {
      return (
         <div className="text-center py-8 text-muted-foreground">
            No notifications to display
         </div>
      );
   }

   return (
      <div className="space-y-2">
         {notifications.map((notification) => (
            <div
               key={notification.id}
               className={cn(
                  "p-4 rounded-lg transition-colors relative group hover:bg-accent",
                  !notification.read && "bg-accent/50"
               )}
            >
               <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                     <h4 className="text-sm font-semibold mb-1">{notification.title}</h4>
                     <p className="text-sm text-muted-foreground">{notification.message}</p>
                     <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                           {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                     </div>
                  </div>
                  {!notification.read && (
                     <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-background rounded-full"
                        title="Mark as read"
                     >
                        <Check className="h-4 w-4" />
                     </button>
                  )}
               </div>
            </div>
         ))}
      </div>
   );
};

export default NotificationList;
