import React from 'react';
import { format } from 'date-fns';
import { CalendarDays, MapPin, FileText, Clock } from 'lucide-react';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const InspectionEventModal = ({ isOpen, onClose, event }) => {
   if (!event) return null;

   const startTime = new Date(event.start);

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Inspection Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
               <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                     <p className="text-sm font-medium leading-none">Application</p>
                     <p className="text-sm text-muted-foreground">
                        {event.extendedProps.applicationNumber}
                     </p>
                  </div>
               </div>

               <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="h-5">
                     {event.extendedProps.applicationType}
                  </Badge>
               </div>

               <div className="flex items-start space-x-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                     <p className="text-sm font-medium leading-none">Date</p>
                     <p className="text-sm text-muted-foreground">
                        {format(startTime, 'MMMM d, yyyy')}
                     </p>
                  </div>
               </div>

               <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                     <p className="text-sm font-medium leading-none">Time</p>
                     <p className="text-sm text-muted-foreground">
                        {format(startTime, 'h:mm a')}
                     </p>
                  </div>
               </div>

               <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                     <p className="text-sm font-medium leading-none">Location</p>
                     <p className="text-sm text-muted-foreground">
                        {event.extendedProps.location || 'Location not specified'}
                     </p>
                  </div>
               </div>

               <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={onClose}>
                     Close
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default InspectionEventModal;
