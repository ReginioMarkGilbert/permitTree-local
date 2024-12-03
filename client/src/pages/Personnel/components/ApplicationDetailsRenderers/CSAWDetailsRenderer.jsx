import React from 'react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import '@/components/ui/styles/customScrollBar.css';

const CSAWDetailsRenderer = ({ data, handlePreview, handleDownload }) => {
   const formatDateString = (dateString) => {
      try {
         const date = new Date(parseInt(dateString));
         if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateString);
            return 'Date not available';
         }
         return format(date, 'MMMM d, yyyy');
      } catch (error) {
         console.error('Error formatting date:', error);
         return 'Date not available';
      }
   };

   const renderFileSection = (files, title) => {
      if (!files || !Array.isArray(files) || files.length === 0) return null;

      return (
         <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">{title}</h4>
            <div className="grid grid-cols-1 gap-2">
               {files.map((file, index) => (
                  <div
                     key={index}
                     className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                  >
                     <span className="text-sm text-gray-600 dark:text-gray-300">{file.filename}</span>
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
         </div>
      );
   };

   const processFiles = (files) => {
      if (!files) return [];
      return Array.isArray(files) ? files : [files];
   };

   return (
      <>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Registration Type</h3>
               <p className="text-gray-900 dark:text-gray-100">{data.registrationType || 'N/A'}</p>
            </div>
            <div>
               <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Chainsaw Store</h3>
               <p className="text-gray-900 dark:text-gray-100">{data.chainsawStore || 'N/A'}</p>
            </div>
            <div>
               <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Owner Name</h3>
               <p className="text-gray-900 dark:text-gray-100">{data.ownerName || 'N/A'}</p>
            </div>
            <div>
               <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Phone</h3>
               <p className="text-gray-900 dark:text-gray-100">{data.phone || 'N/A'}</p>
            </div>
         </div>

         <Separator className="my-4" />

         <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Chainsaw Details</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Brand</h3>
                  <p className="text-gray-900 dark:text-gray-100">{data.brand || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Model</h3>
                  <p className="text-gray-900 dark:text-gray-100">{data.model || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Serial Number</h3>
                  <p className="text-gray-900 dark:text-gray-100">{data.serialNumber || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Power Output</h3>
                  <p className="text-gray-900 dark:text-gray-100">{data.powerOutput || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Guide Bar Length</h3>
                  <p className="text-gray-900 dark:text-gray-100">{data.maxLengthGuidebar || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Country of Origin</h3>
                  <p className="text-gray-900 dark:text-gray-100">{data.countryOfOrigin || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Purchase Price</h3>
                  <p className="text-gray-900 dark:text-gray-100">{data.purchasePrice ? `₱${data.purchasePrice.toLocaleString()}` : 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Date of Acquisition</h3>
                  <p className="text-gray-900 dark:text-gray-100">{data.dateOfAcquisition ? formatDateString(data.dateOfAcquisition) : 'N/A'}</p>
               </div>
            </div>
         </div>

         <Separator className="my-4" />

         <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Supporting Documents</h3>
            {data.files && (
               <ScrollArea className="h-[300px] custom-scrollbar">
                  <div className="space-y-4 pr-4">
                     {renderFileSection(processFiles(data.files.permitToPurchase), "Permit to Purchase")}
                     {renderFileSection(processFiles(data.files.officialReceipt), "Official Receipt")}
                     {renderFileSection(processFiles(data.files.deedOfSale), "Deed of Sale")}
                     {renderFileSection(processFiles(data.files.specialPowerOfAttorney), "Special Power of Attorney")}
                     {renderFileSection(processFiles(data.files.forestTenureAgreement), "Forest Tenure Agreement")}
                     {renderFileSection(processFiles(data.files.businessPermit), "Business Permit")}
                     {renderFileSection(processFiles(data.files.certificateOfRegistration), "Certificate of Registration")}
                     {renderFileSection(processFiles(data.files.woodProcessingPlantPermit), "Wood Processing Plant Permit")}
                  </div>
               </ScrollArea>
            )}
         </div>
      </>
   );
};

export default CSAWDetailsRenderer;
