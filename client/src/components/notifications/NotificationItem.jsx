import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Bell, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const NotificationItem = ({ notification }) => {
   const getTypeColor = (type) => {
      if (type.startsWith('APPLICATION_')) return 'bg-blue-500/10 text-blue-500';
      if (type.startsWith('PAYMENT_') || type.startsWith('OOP_')) return 'bg-green-500/10 text-green-500';
      return 'bg-gray-500/10 text-gray-500';
   };

   return (
      <div className="flex items-start gap-4">
         <div className={cn(
            "p-2 rounded-full",
            getTypeColor(notification.type)
         )}>
            <Bell className="h-4 w-4" />
         </div>

         <div className="flex-1">
            <div className="flex items-center justify-between">
               <h4 className="font-medium">
                  <Badge variant="outline" className="mr-2 text-sm">
                     {notification.title}
                  </Badge>
                  {/* {notification.title} */}
               </h4>

               <span className="text-xs text-muted-foreground">
                  {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
               </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            {notification.metadata?.remarks && (
               <p className="text-sm text-muted-foreground mt-1 italic">
                  Note: {notification.metadata.remarks}
               </p>
            )}
            {/* {notification.metadata?.stage && (
               <Badge variant="outline" className="mt-2">
                  {notification.metadata.stage}
               </Badge>
            )} */}
         </div>

         {!notification.read && (
            <div className="shrink-0">
               <div className="h-2 w-2 rounded-full bg-red-400" />
            </div>
         )}
      </div>
   );
};

export default NotificationItem;
