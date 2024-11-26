import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQuery, gql } from '@apollo/client';
import { Download, Eye, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";

const GET_INSPECTION_DETAILS = gql`
  query GetInspectionsByPermit($permitId: ID!) {
    getInspectionsByPermit(permitId: $permitId) {
      id
      scheduledDate
      scheduledTime
      location
      inspectionStatus
      findings {
        result
        observations
        recommendations
        attachments {
          filename
          contentType
          data
        }
      }
      history {
        action
        timestamp
        notes
      }
    }
  }
`;

const InspectionReportReviewModal = ({ isOpen, onClose, application }) => {
   const { data, loading, error } = useQuery(GET_INSPECTION_DETAILS, {
      variables: { permitId: application?.id },
      skip: !application?.id
   });

   const formatDate = (timestamp) => {
      if (!timestamp) return 'Not scheduled';
      try {
         const date = parseISO(timestamp);
         if (isNaN(date.getTime())) {
            return 'Invalid date';
         }
         return format(date, 'MMM d, yyyy');
      } catch (error) {
         return 'Invalid date';
      }
   };

   const formatTime = (time) => {
      if (!time) return 'Not specified';
      const [hours, minutes] = time.split(':');
      const parsedHours = parseInt(hours, 10);
      const ampm = parsedHours >= 12 ? 'PM' : 'AM';
      const formattedHours = parsedHours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
   };

   const handleDownload = (file) => {
      const byteCharacters = atob(file.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
         byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.contentType });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const handlePreview = (file) => {
      const byteCharacters = atob(file.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
         byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.contentType });

      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
   };

   const getResultBadgeColor = (result) => {
      switch (result) {
         case 'Pass':
            return 'bg-green-100 text-green-800';
         case 'Fail':
            return 'bg-red-100 text-red-800';
         case 'Needs Modification':
            return 'bg-yellow-100 text-yellow-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   const getStatusBadgeColor = (status) => {
      switch (status) {
         case 'Scheduled':
            return 'bg-blue-100 text-blue-800';
         case 'Completed':
            return 'bg-green-100 text-green-800';
         case 'Cancelled':
            return 'bg-red-100 text-red-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   if (loading) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
               <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   if (error) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
               <div className="text-red-500 p-6">
                  Error loading inspection details: {error.message}
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   const inspection = data?.getInspectionsByPermit[0];

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle>Inspection Report Review</DialogTitle>
               <DialogDescription>
                  Application Number: {application?.applicationNumber}
               </DialogDescription>
            </DialogHeader>

            {inspection ? (
               <div className="space-y-6">
                  {/* Inspection Details */}
                  <div>
                     <h3 className="text-lg font-semibold mb-2">Inspection Details</h3>
                     <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                           <p className="text-sm text-gray-500">Date</p>
                           <p className="font-medium">
                              {formatDate(inspection.scheduledDate)}
                           </p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-500">Time</p>
                           <p className="font-medium">
                              {formatTime(inspection.scheduledTime)}
                           </p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-500">Location</p>
                           <p className="font-medium">{inspection.location}</p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-500">Inspection Status</p>
                           <Badge variant="outline" className={getStatusBadgeColor(inspection.inspectionStatus)}>
                              {inspection.inspectionStatus}
                           </Badge>
                        </div>
                        <div>
                           <p className="text-sm text-gray-500">Result</p>
                           <Badge variant="outline" className={getResultBadgeColor(inspection.findings?.result)}>
                              {inspection.findings?.result || 'Pending'}
                           </Badge>
                        </div>
                     </div>
                  </div>

                  <Separator />

                  {/* Findings */}
                  <div>
                     <h3 className="text-lg font-semibold mb-2">Findings</h3>
                     <div className="space-y-4">
                        <div>
                           <h4 className="font-medium text-gray-700">Observations</h4>
                           <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                              {inspection.findings?.observations || 'No observations recorded'}
                           </p>
                        </div>
                        <div>
                           <h4 className="font-medium text-gray-700">Recommendations</h4>
                           <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                              {inspection.findings?.recommendations || 'No recommendations provided'}
                           </p>
                        </div>
                     </div>
                  </div>

                  <Separator />

                  {/* Attachments */}
                  <div>
                     <h3 className="text-lg font-semibold mb-2">Attachments</h3>
                     {inspection.findings?.attachments?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                           {inspection.findings.attachments.map((file, index) => (
                              <div
                                 key={index}
                                 className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                              >
                                 <span className="text-sm text-gray-600">{file.filename}</span>
                                 <div className="flex gap-2">
                                    <TooltipProvider delayDuration={250}>
                                       <Tooltip>
                                          <TooltipTrigger asChild>
                                             <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => handlePreview(file)}
                                             >
                                                <Eye className="h-4 w-4" />
                                             </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                             <p>Preview</p>
                                          </TooltipContent>
                                       </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider delayDuration={250}>
                                       <Tooltip>
                                          <TooltipTrigger asChild>
                                             <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => handleDownload(file)}
                                             >
                                                <Download className="h-4 w-4" />
                                             </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                             <p>Download</p>
                                          </TooltipContent>
                                       </Tooltip>
                                    </TooltipProvider>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-gray-500">No attachments uploaded</p>
                     )}
                  </div>

                  {/* History */}
                  <Separator />
                  {/* <div>
                     <h3 className="text-lg font-semibold mb-2">History</h3>
                     <div className="space-y-2">
                        {inspection.history?.map((entry, index) => (
                           <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between text-sm">
                                 <span className="font-medium">{entry.action}</span>
                                 <span className="text-gray-500">
                                    {formatDate(entry.timestamp)}
                                 </span>
                              </div>
                              {entry.notes && (
                                 <p className="text-gray-600 text-sm mt-1">{entry.notes}</p>
                              )}
                           </div>
                        ))}
                     </div>
                  </div> */}
               </div>
            ) : (
               <div className="text-center py-6 text-gray-500">
                  No inspection report found for this application.
               </div>
            )}
         </DialogContent>
      </Dialog>
   );
};

export default InspectionReportReviewModal;
