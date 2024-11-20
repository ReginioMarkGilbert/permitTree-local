import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import TS_ScheduleInspectionModal from './TS_ScheduleInspectionModal';
import TS_InspectionReportModal from './TS_InspectionReportModal';

const InspectionApplicationRow = ({
   application,
   inspection,
   formatInspectionStatus,
   isScheduleDisabled,
   isMobile,
   onRefetch
}) => {
   const [showScheduleModal, setShowScheduleModal] = useState(false);
   const [showReportModal, setShowReportModal] = useState(false);

   const handleSchedule = () => {
      setShowScheduleModal(true);
   };

   const handleComplete = () => {
      setShowReportModal(true);
   };

   const handleScheduleComplete = () => {
      setShowScheduleModal(false);
      onRefetch();
   };

   const handleReportComplete = () => {
      setShowReportModal(false);
      onRefetch();
   };

   const renderActionButtons = () => {
      const actions = [];

      // Schedule/Reschedule action
      actions.push(
         <TooltipProvider key="schedule-action">
            <Tooltip delayDuration={200}>
               <TooltipTrigger asChild>
                  <Button
                     onClick={handleSchedule}
                     variant="outline"
                     size="icon"
                     className="h-8 w-8"
                     disabled={isScheduleDisabled(application.id)}
                  >
                     <Calendar className="h-4 w-4" />
                  </Button>
               </TooltipTrigger>
               <TooltipContent>
                  <p>
                     {isScheduleDisabled(application.id)
                        ? 'Inspection Scheduled'
                        : inspection?.inspectionStatus === 'Completed'
                           ? 'Reschedule Inspection'
                           : 'Schedule Inspection'}
                  </p>
               </TooltipContent>
            </Tooltip>
         </TooltipProvider>
      );

      // Complete inspection action
      if (inspection?.inspectionStatus === 'Pending') {
         actions.push(
            <TooltipProvider key="complete-action">
               <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                     <Button
                        onClick={handleComplete}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-800"
                     >
                        <FileCheck className="h-4 w-4" />
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>Complete Inspection</p>
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         );
      }

      return actions;
   };

   if (isMobile) {
      return (
         <>
            <div className="bg-white/60 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                     <h3 className="font-medium text-gray-900">
                        {application.applicationNumber}
                     </h3>
                     <p className="text-sm text-gray-500">
                        {application.applicationType}
                     </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full
                     ${inspection?.inspectionStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                     inspection?.inspectionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                     inspection?.inspectionStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                     'bg-gray-100 text-gray-800'}`}>
                     {formatInspectionStatus(inspection)}
                  </span>
               </div>

               <p className="text-sm text-gray-500">
                  {format(new Date(application.dateOfSubmission), 'MMM d, yyyy')}
               </p>

               <div className="flex gap-2 pt-1">
                  {renderActionButtons()}
               </div>
            </div>

            {/* Modals */}
            {showScheduleModal && (
               <TS_ScheduleInspectionModal
                  isOpen={showScheduleModal}
                  onClose={() => setShowScheduleModal(false)}
                  application={application}
                  onScheduleComplete={handleScheduleComplete}
               />
            )}

            {showReportModal && (
               <TS_InspectionReportModal
                  isOpen={showReportModal}
                  onClose={() => setShowReportModal(false)}
                  inspection={inspection}
                  application={application}
                  onComplete={handleReportComplete}
               />
            )}
         </>
      );
   }

   return (
      <>
         <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
               <div className="text-sm text-gray-900">{application.applicationNumber}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
               <div className="text-sm text-gray-900">{application.applicationType}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
               <div className="text-sm text-gray-900">
                  {format(new Date(application.dateOfSubmission), 'MMM d, yyyy')}
               </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
               <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${inspection?.inspectionStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  inspection?.inspectionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                  inspection?.inspectionStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}`}>
                  {formatInspectionStatus(inspection)}
               </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
               <div className="flex items-center space-x-2">
                  {renderActionButtons()}
               </div>
            </td>
         </tr>

         {/* Modals */}
         {showScheduleModal && (
            <TS_ScheduleInspectionModal
               isOpen={showScheduleModal}
               onClose={() => setShowScheduleModal(false)}
               application={application}
               onScheduleComplete={handleScheduleComplete}
            />
         )}

         {showReportModal && (
            <TS_InspectionReportModal
               isOpen={showReportModal}
               onClose={() => setShowReportModal(false)}
               inspection={inspection}
               application={application}
               onComplete={handleReportComplete}
            />
         )}
      </>
   );
};

export default InspectionApplicationRow;
