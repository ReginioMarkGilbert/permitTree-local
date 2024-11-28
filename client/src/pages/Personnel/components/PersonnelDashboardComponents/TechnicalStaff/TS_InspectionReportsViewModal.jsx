import React from 'react';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Eye, Download, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { gql, useQuery } from '@apollo/client';

const GET_INSPECTION_REPORTS = gql`
  query GetInspectionReports($applicationId: ID!) {
    getInspectionReportsByApplicationId(applicationId: $applicationId) {
      id
      applicationId
      inspectionDate
      inspectionTime
      findings
      recommendations
      uploadedFiles {
        filename
        contentType
        fileData
        uploadDate
      }
      createdAt
    }
  }
`;

const TS_InspectionReportsViewModal = ({ isOpen, onClose, applicationId }) => {
   const { loading, error, data } = useQuery(GET_INSPECTION_REPORTS, {
      variables: { applicationId },
      skip: !isOpen
   });

   const handleDownload = (fileData, filename, contentType) => {
      try {
         const byteCharacters = atob(fileData);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         const file = new Blob([byteArray], { type: contentType });
         const link = document.createElement('a');
         link.href = URL.createObjectURL(file);
         link.download = filename;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(link.href);
      } catch (error) {
         console.error('Error downloading file:', error);
         toast.error('Error downloading file');
      }
   };

   const handlePreview = (fileData, contentType) => {
      try {
         const byteCharacters = atob(fileData);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         const file = new Blob([byteArray], { type: contentType });
         const fileUrl = URL.createObjectURL(file);
         window.open(fileUrl, '_blank');
         URL.revokeObjectURL(fileUrl);
      } catch (error) {
         console.error('Error previewing file:', error);
         toast.error('Error previewing file');
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>Inspection Reports</DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-grow pr-4">
               {loading && (
                  <div className="flex items-center justify-center py-8">
                     <Loader2 className="h-6 w-6 animate-spin" />
                     <span className="ml-2">Loading inspection reports...</span>
                  </div>
               )}

               {error && (
                  <div className="text-red-500 text-center py-4">
                     Error loading inspection reports
                  </div>
               )}

               {data?.getInspectionReportsByApplicationId?.map((report, index) => (
                  <div key={report.id} className="mb-6 p-4 border rounded-lg">
                     <h3 className="font-semibold mb-2">
                        Inspection Report #{index + 1}
                     </h3>
                     <div className="space-y-2 text-sm">
                        <p>
                           <span className="font-medium">Date: </span>
                           {format(new Date(report.inspectionDate), 'MMMM d, yyyy')}
                        </p>
                        <p>
                           <span className="font-medium">Time: </span>
                           {report.inspectionTime}
                        </p>
                        <p>
                           <span className="font-medium">Findings: </span>
                           {report.findings}
                        </p>
                        <p>
                           <span className="font-medium">Recommendations: </span>
                           {report.recommendations}
                        </p>

                        {report.uploadedFiles?.length > 0 && (
                           <div className="mt-4">
                              <p className="font-medium mb-2">Attached Files:</p>
                              <div className="space-y-2">
                                 {report.uploadedFiles.map((file, fileIndex) => (
                                    <div key={fileIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                       <span className="truncate">{file.filename}</span>
                                       <div className="flex gap-2">
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => handlePreview(file.fileData, file.contentType)}
                                          >
                                             <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => handleDownload(file.fileData, file.filename, file.contentType)}
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
                  </div>
               ))}

               {data?.getInspectionReportsByApplicationId?.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                     No inspection reports found
                  </div>
               )}
            </ScrollArea>
         </DialogContent>
      </Dialog>
   );
};

export default TS_InspectionReportsViewModal; 
