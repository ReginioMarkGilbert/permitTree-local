import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";

const CertificateViewModal = ({ isOpen, onClose, certificate, loading, error }) => {
   const [previewUrl, setPreviewUrl] = useState(null);

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
      } catch (error) {
         console.error('Error downloading file:', error);
         toast.error('Error downloading file');
      }
   };

   const handlePreview = (fileData, contentType, filename) => {
      try {
         const byteCharacters = atob(fileData);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         const file = new Blob([byteArray], { type: contentType });
         const fileUrl = URL.createObjectURL(file);

         // For PDFs
         if (contentType === 'application/pdf') {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
               newWindow.location = fileUrl;
            } else {
               toast.error('Pop-up was blocked. Please allow pop-ups for this site.');
               handleDownload(fileData, filename, contentType);
            }
         }
         // For images
         else if (contentType.startsWith('image/')) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
               newWindow.document.write(`
                  <html>
                     <head>
                        <title>${filename}</title>
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
                        <img src="${fileUrl}" alt="${filename}" />
                     </body>
                  </html>
               `);
            } else {
               toast.error('Pop-up was blocked. Please allow pop-ups for this site.');
               handleDownload(fileData, filename, contentType);
            }
         }
         // For other file types
         else {
            toast.error('Preview not supported for this file type. Downloading instead...');
            handleDownload(fileData, filename, contentType);
         }

         setPreviewUrl(fileUrl);
      } catch (error) {
         console.error('Error previewing file:', error);
         toast.error('Error previewing file');
      }
   };

   // Cleanup preview URL when component unmounts or modal closes
   useEffect(() => {
      return () => {
         if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
         }
      };
   }, [previewUrl]);

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
                  Error loading certificate: {error.message}
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   if (!certificate) return null;

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>Certificate Details</DialogTitle>
               <DialogDescription>
                  Certificate Number: {certificate.certificateNumber}
               </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-grow">
               <div className="space-y-6 p-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <h3 className="font-semibold mb-2">Certificate Information</h3>
                        <div className="space-y-2">
                           <p><span className="font-medium">Status:</span>
                              <Badge className="ml-2" variant={certificate.certificateStatus === 'Active' ? 'success' : 'secondary'}>
                                 {certificate.certificateStatus}
                              </Badge>
                           </p>
                           <p><span className="font-medium">Created:</span> {format(new Date(parseInt(certificate.dateCreated)), 'PPP')}</p>
                           {certificate.dateIssued && (
                              <p><span className="font-medium">Issued:</span> {format(new Date(parseInt(certificate.dateIssued)), 'PPP')}</p>
                           )}
                           {certificate.expiryDate && (
                              <p><span className="font-medium">Expires:</span> {format(new Date(parseInt(certificate.expiryDate)), 'PPP')}</p>
                           )}
                        </div>
                     </div>

                     {certificate.uploadedCertificate && (
                        <div>
                           <h3 className="font-semibold mb-2">Document</h3>
                           <div className="space-y-2">
                              <p className="text-sm">{certificate.uploadedCertificate.filename}</p>
                              <div className="flex gap-2">
                                 <TooltipProvider>
                                    <Tooltip>
                                       <TooltipTrigger asChild>
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => handlePreview(
                                                certificate.uploadedCertificate.fileData,
                                                certificate.uploadedCertificate.contentType,
                                                certificate.uploadedCertificate.filename
                                             )}
                                          >
                                             <Eye className="h-4 w-4 mr-2" />
                                             Preview
                                          </Button>
                                       </TooltipTrigger>
                                       <TooltipContent>
                                          <p>Preview certificate</p>
                                       </TooltipContent>
                                    </Tooltip>
                                 </TooltipProvider>

                                 <TooltipProvider>
                                    <Tooltip>
                                       <TooltipTrigger asChild>
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => handleDownload(
                                                certificate.uploadedCertificate.fileData,
                                                certificate.uploadedCertificate.filename,
                                                certificate.uploadedCertificate.contentType
                                             )}
                                          >
                                             <Download className="h-4 w-4 mr-2" />
                                             Download
                                          </Button>
                                       </TooltipTrigger>
                                       <TooltipContent>
                                          <p>Download certificate</p>
                                       </TooltipContent>
                                    </Tooltip>
                                 </TooltipProvider>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  <Separator />

                  {certificate.uploadedCertificate?.metadata && (
                     <div>
                        <h3 className="font-semibold mb-2">Additional Information</h3>
                        <div className="space-y-2">
                           <p><span className="font-medium">Certificate Type:</span> {certificate.uploadedCertificate.metadata.certificateType}</p>
                           {certificate.uploadedCertificate.metadata.remarks && (
                              <p><span className="font-medium">Remarks:</span> {certificate.uploadedCertificate.metadata.remarks}</p>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </ScrollArea>

            <DialogFooter>
               <Button variant="outline" onClick={onClose}>
                  Close
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default CertificateViewModal;
