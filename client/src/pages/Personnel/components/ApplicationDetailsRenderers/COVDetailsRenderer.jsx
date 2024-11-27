import React from 'react';
import { Separator } from '@/components/ui/separator';
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

const COVDetailsRenderer = ({ data, handlePreview, handleDownload }) => {
   console.log('COV Data received:', data);
   console.log('Files received:', data.files);

   const renderFileSection = (files, title) => {
      console.log(`Rendering ${title}:`, files);

      if (!files || !Array.isArray(files) || files.length === 0) {
         console.log(`No files for ${title}`);
         return null;
      }

      return (
         <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">{title}</h4>
            <div className="grid grid-cols-1 gap-2">
               {files.map((file, index) => {
                  console.log(`File ${index} in ${title}:`, file);

                  if (!file || !file.filename) {
                     console.warn(`Invalid file at index ${index} for ${title}`);
                     return null;
                  }

                  return (
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
                  );
               })}
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
               <h3 className="font-semibold text-sm text-gray-500">Name</h3>
               <p>{data.name || 'N/A'}</p>
            </div>
            <div>
               <h3 className="font-semibold text-sm text-gray-500">Address</h3>
               <p>{data.address || 'N/A'}</p>
            </div>
            <div>
               <h3 className="font-semibold text-sm text-gray-500">Cellphone</h3>
               <p>{data.cellphone || 'N/A'}</p>
            </div>
            <div>
               <h3 className="font-semibold text-sm text-gray-500">Purpose</h3>
               <p className="whitespace-pre-wrap">{data.purpose || 'N/A'}</p>
            </div>
         </div>

         <Separator className="my-4" />

         <div className="space-y-4">
            <h3 className="font-semibold">Transportation Details</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <h3 className="font-semibold text-sm text-gray-500">Driver Name</h3>
                  <p>{data.driverName || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500">Driver License Number</h3>
                  <p>{data.driverLicenseNumber || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500">Vehicle Plate Number</h3>
                  <p>{data.vehiclePlateNumber || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500">Origin Address</h3>
                  <p>{data.originAddress || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500">Destination Address</h3>
                  <p>{data.destinationAddress || 'N/A'}</p>
               </div>
            </div>
         </div>

         <Separator className="my-4" />

         <div className="space-y-4">
            <h3 className="font-semibold">Supporting Documents</h3>
            {data.files && (
               <ScrollArea className="h-[300px] custom-scrollbar">
                  <div className="space-y-4 pr-4">
                     {renderFileSection(processFiles(data.files.letterOfIntent), "Letter of Intent")}
                     {renderFileSection(processFiles(data.files.tallySheet), "Tally Sheet")}
                     {renderFileSection(processFiles(data.files.forestCertification), "Forest Certification")}
                     {renderFileSection(processFiles(data.files.orCr), "OR/CR")}
                     {renderFileSection(processFiles(data.files.driverLicense), "Driver's License")}
                     {renderFileSection(processFiles(data.files.specialPowerOfAttorney), "Special Power of Attorney")}
                  </div>
               </ScrollArea>
            )}
         </div>
      </>
   );
};

export default COVDetailsRenderer;
