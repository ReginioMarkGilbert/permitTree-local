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
import { DialogDescription } from '@/components/ui/dialog';

const TCEBPDetailsRenderer = ({ data, handlePreview, handleDownload }) => {
   console.log('TCEBP Data received:', data);
   console.log('Files received:', data.files);

   const renderFileSection = (files, title) => {
      if (!files || !Array.isArray(files) || files.length === 0) return null;

      return (
         <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">{title}</h4>
            <div className="grid grid-cols-1 gap-2">
               {files.map((file, index) => (
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
         </div>
      );
   };

   const processFiles = (files) => {
      if (!files) return [];
      return Array.isArray(files) ? files : [files];
   };

   return (
      <>
         <DialogDescription className="sr-only">
            Tree Cutting and/or Earth Balling Permit Details
         </DialogDescription>

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
               <h3 className="font-semibold text-sm text-gray-500">Contact Number</h3>
               <p>{data.contactNumber || 'N/A'}</p>
            </div>
            <div>
               <h3 className="font-semibold text-sm text-gray-500">Request Type</h3>
               <p>{data.requestType || 'N/A'}</p>
            </div>
         </div>

         <Separator className="my-4" />

         <div className="space-y-4">
            <h3 className="font-semibold">Project Details</h3>
            <div>
               <h3 className="font-semibold text-sm text-gray-500">Purpose</h3>
               <p className="whitespace-pre-wrap">{data.purpose || 'N/A'}</p>
            </div>
         </div>

         <Separator className="my-4" />

         <div className="space-y-4">
            <h3 className="font-semibold">Supporting Documents</h3>
            {data.files && (
               <ScrollArea className="h-[300px] custom-scrollbar">
                  <div className="space-y-4 pr-4">
                     {renderFileSection(processFiles(data.files.letterOfIntent), "Letter of Intent")}
                     {renderFileSection(processFiles(data.files.lguEndorsement), "LGU Endorsement")}
                     {renderFileSection(processFiles(data.files.landTenurial), "Land Tenurial Instrument")}
                     {renderFileSection(processFiles(data.files.siteDevelopmentPlan), "Site Development Plan")}
                     {renderFileSection(processFiles(data.files.environmentalCompliance), "Environmental Compliance")}
                     {renderFileSection(processFiles(data.files.fpic), "FPIC")}
                     {renderFileSection(processFiles(data.files.ownerConsent), "Owner's Consent")}
                     {renderFileSection(processFiles(data.files.pambClearance), "PAMB Clearance")}
                  </div>
               </ScrollArea>
            )}
         </div>
      </>
   );
};

export default TCEBPDetailsRenderer;
