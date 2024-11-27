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

const PTPRDetailsRenderer = ({ data, handlePreview, handleDownload }) => {
   console.log('PTPR Data received:', data);
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
            Private Tree Plantation Registration Details
         </DialogDescription>

         <div className="grid grid-cols-2 gap-4">
            <div>
               <h3 className="font-semibold text-sm text-gray-500">Owner Name</h3>
               <p>{data.ownerName || 'N/A'}</p>
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
               <h3 className="font-semibold text-sm text-gray-500">Lot Area</h3>
               <p>{data.lotArea ? `${data.lotArea} hectares` : 'N/A'}</p>
            </div>
         </div>

         <Separator className="my-4" />

         <div className="space-y-4">
            <h3 className="font-semibold">Plantation Details</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <h3 className="font-semibold text-sm text-gray-500">Tree Species</h3>
                  <p>{data.treeSpecies?.length > 0 ? data.treeSpecies.join(', ') : 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500">Total Trees</h3>
                  <p>{data.totalTrees || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500">Tree Spacing</h3>
                  <p>{data.treeSpacing || 'N/A'}</p>
               </div>
               <div>
                  <h3 className="font-semibold text-sm text-gray-500">Year Planted</h3>
                  <p>{data.yearPlanted || 'N/A'}</p>
               </div>
            </div>
         </div>

         <Separator className="my-4" />

         <div className="space-y-4">
            <h3 className="font-semibold">Supporting Documents</h3>
            {data.files && (
               <ScrollArea className="h-[300px] custom-scrollbar">
                  <div className="space-y-4 pr-4">
                     {renderFileSection(processFiles(data.files.letterRequest), "Letter Request")}
                     {renderFileSection(processFiles(data.files.titleOrTaxDeclaration), "Title or Tax Declaration")}
                     {renderFileSection(processFiles(data.files.darCertification), "DAR Certification")}
                     {renderFileSection(processFiles(data.files.specialPowerOfAttorney), "Special Power of Attorney")}
                  </div>
               </ScrollArea>
            )}
         </div>
      </>
   );
};

export default PTPRDetailsRenderer;
