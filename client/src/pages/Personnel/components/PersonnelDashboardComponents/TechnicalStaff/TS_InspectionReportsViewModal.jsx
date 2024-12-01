import React from 'react';
import PropTypes from 'prop-types';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Loader2, FileText } from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { gql, useQuery } from '@apollo/client';

const GET_INSPECTION_REPORTS = gql`
  query GetInspectionsByPermit($permitId: ID!) {
    getInspectionsByPermit(permitId: $permitId) {
      id
      inspectionStatus
      scheduledDate
      scheduledTime
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
    }
  }
`;

const TS_InspectionReportsViewModal = ({ isOpen, onClose, permitId }) => {
   console.log('PermitId in modal:', permitId);

   const { loading, error, data } = useQuery(GET_INSPECTION_REPORTS, {
      variables: { permitId },
      skip: !permitId || !isOpen,
   });

   console.log('Inspection reports data:', data);

   const handleDownload = (file) => {
      try {
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
      } catch (error) {
         console.error('Download error:', error);
         toast.error('Failed to download file');
      }
   };

   const handlePreview = (file) => {
      try {
         const byteCharacters = atob(file.data);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         const blob = new Blob([byteArray], { type: file.contentType });
         const fileUrl = URL.createObjectURL(blob);

         // For images
         if (file.contentType.startsWith('image/')) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
               newWindow.document.write(`
                  <html>
                     <head>
                        <title>${file.filename}</title>
                        <style>
                           body {
                              margin: 0;
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              min-height: 100vh;
                              background: #f1f5f9;
                           }
                           img {
                              max-width: 100%;
                              max-height: 100vh;
                              object-fit: contain;
                           }
                        </style>
                     </head>
                     <body>
                        <img src="${fileUrl}" alt="${file.filename}" />
                     </body>
                  </html>
               `);
               newWindow.document.close();
            } else {
               toast.error('Pop-up was blocked. Please allow pop-ups for this site.');
               handleDownload(file);
            }
         }
         // For PDFs
         else if (file.contentType === 'application/pdf') {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
               newWindow.location = fileUrl;
            } else {
               toast.error('Pop-up was blocked. Please allow pop-ups for this site.');
               handleDownload(file);
            }
         }
         // For other file types
         else {
            toast.error('Preview not supported for this file type. Downloading instead...');
            handleDownload(file);
         }

         // Clean up URL after a delay
         setTimeout(() => {
            URL.revokeObjectURL(fileUrl);
         }, 1000);
      } catch (error) {
         console.error('Preview error:', error);
         toast.error('Failed to preview file. Downloading instead...');
         handleDownload(file);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
               <DialogTitle>Inspection Reports</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1">
               {loading ? (
                  <div className="flex items-center justify-center p-4">
                     <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
               ) : error ? (
                  <div className="text-center text-red-500 p-4">
                     Error loading inspection reports: {error.message}
                  </div>
               ) : data?.getInspectionsByPermit?.length > 0 ? (
                  <div className="space-y-6 p-4">
                     {data.getInspectionsByPermit.map((inspection, index) => (
                        <div key={inspection.id} className="grid gap-5 border rounded-lg p-4">
                           <div className="flex justify-between items-center">
                              <h3 className="font-semibold text-lg">
                                 {/* Inspection #{index + 1} - {format(new Date(inspection.scheduledDate), 'LLL d, yyyy')} */}
                                 Inspection Date: {format(new Date(inspection.scheduledDate), 'LLL d, yyyy')}
                              </h3>
                              <Badge variant="outline" className={
                                 inspection.inspectionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                 inspection.inspectionStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-blue-100 text-blue-800'
                              }>
                                 {inspection.inspectionStatus}
                              </Badge>
                           </div>

                           <div className="grid gap-4">
                              <div>
                                 <h4 className="font-semibold text-base mb-1 text-gray-900">Result</h4>
                                 <p className="text-gray-600">{inspection.findings?.result || 'No result recorded'}</p>
                              </div>
                              <div>
                                 <h4 className="font-semibold text-base mb-1 text-gray-900">Observations</h4>
                                 <p className="text-gray-600">{inspection.findings?.observations || 'No observations recorded'}</p>
                              </div>
                              <div>
                                 <h4 className="font-semibold text-base mb-1 text-gray-900">Recommendations</h4>
                                 <p className="text-gray-600">{inspection.findings?.recommendations || 'No recommendations recorded'}</p>
                              </div>
                           </div>

                           {inspection.findings?.attachments?.length > 0 && (
                              <div>
                                 <h4 className="font-semibold text-base mb-2 text-gray-900">Attachments</h4>
                                 <div className="grid gap-2">
                                    {inspection.findings.attachments.map((file, fileIndex) => (
                                       <div key={fileIndex}
                                          className="flex items-center justify-between p-3 bg-gray-50 border rounded hover:bg-gray-100 transition-colors">
                                          <div className="flex items-center gap-2">
                                             <FileText className="h-4 w-4 text-gray-500" />
                                             <span className="text-sm text-gray-600">{file.filename}</span>
                                          </div>
                                          <div className="flex gap-1">
                                             <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePreview(file)}
                                                className="hover:bg-gray-200"
                                             >
                                                <Eye className="h-4 w-4" />
                                             </Button>
                                             <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(file)}
                                                className="hover:bg-gray-200"
                                             >
                                                <Download className="h-4 w-4" />
                                             </Button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center p-4 text-gray-500">
                     No inspection reports found for this application
                  </div>
               )}
            </ScrollArea>
         </DialogContent>
      </Dialog>
   );
};

TS_InspectionReportsViewModal.propTypes = {
   isOpen: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
   permitId: PropTypes.string.isRequired,
};

export default TS_InspectionReportsViewModal;
