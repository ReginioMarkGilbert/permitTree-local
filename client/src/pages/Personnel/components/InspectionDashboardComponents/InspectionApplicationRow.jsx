import React, { useState } from 'react';
import { Eye, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';
import InspectionScheduleModal from './TS_ScheduleInspectionModal';
import ViewApplicationModal from './TS_InspectionReportModal';

const InspectionApplicationRow = ({
  application,
  inspection,
  formatInspectionStatus,
  isScheduleDisabled,
  isMobile,
  onRefetch
}) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

   const renderActionButtons = () => {
      const actions = [
         {
            icon: Eye,
            label: "View Application",
            onClick: () => setIsViewModalOpen(true),
            variant: "outline"
         },
         {
            icon: Calendar,
            label: "Schedule Inspection",
            onClick: () => setIsScheduleModalOpen(true),
            variant: "outline",
            disabled: isScheduleDisabled(application.id)
         }
      ];

      return actions.map((action, index) => (
         <TooltipProvider key={index}>
            <Tooltip>
               <TooltipTrigger asChild>
                  <Button
                     variant={action.variant}
                     size="icon"
                     onClick={action.onClick}
                     disabled={action.disabled}
                  >
                     <action.icon className="h-4 w-4" />
                  </Button>
               </TooltipTrigger>
               <TooltipContent>
                  <p>{action.label}</p>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>
      ));
   };

   if (isMobile) {
      return (
         <>
            <Card className="p-4 space-y-3">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="font-medium text-foreground">{application.applicationNumber}</p>
                     <p className="text-sm text-muted-foreground">{application.applicationType}</p>
                  </div>
                  <Badge variant="outline" className="text-foreground">
                     {formatInspectionStatus(inspection)}
                  </Badge>
               </div>
               <p className="text-sm text-muted-foreground">
                  {format(new Date(application.dateOfSubmission), 'MMM d, yyyy')}
               </p>
               <div className="flex gap-2">
                  {renderActionButtons()}
               </div>
            </Card>

            {/* Modals */}
            <ViewApplicationModal
               isOpen={isViewModalOpen}
               onClose={() => setIsViewModalOpen(false)}
               application={application}
            />
            <InspectionScheduleModal
               isOpen={isScheduleModalOpen}
               onClose={() => setIsScheduleModalOpen(false)}
               application={application}
               onScheduled={onRefetch}
            />
         </>
      );
   }

   return (
      <>
         <TableRow>
            <TableCell className="font-medium">{application.applicationNumber}</TableCell>
            <TableCell>{application.applicationType}</TableCell>
            <TableCell>{format(new Date(application.dateOfSubmission), 'MMM d, yyyy')}</TableCell>
            <TableCell>
               <Badge variant="outline">
                  {formatInspectionStatus(inspection)}
               </Badge>
            </TableCell>
            <TableCell className="text-right">
               <div className="flex justify-end gap-2">
                  {renderActionButtons()}
               </div>
            </TableCell>
         </TableRow>

         {/* Modals */}
         <ViewApplicationModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={application}
         />
         <InspectionScheduleModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            application={application}
            onScheduled={onRefetch}
         />
      </>
   );
};

export default InspectionApplicationRow;
