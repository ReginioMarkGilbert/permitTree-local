import React, { useState } from 'react';
import { Eye, FileCheck2, RotateCcw, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { format } from 'date-fns';
import ViewOOPModal from '@/pages/user/components/ViewOOPModal';
import ReviewPaymentModal from './ReviewPaymentModal';
import GenerateORModal from './GenerateORModal';
import { toast } from 'sonner';

const BC_OOPRow = ({ oop, onReviewComplete, currentTab, isMobile }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [isGenerateORModalOpen, setIsGenerateORModalOpen] = useState(false);

   const handleViewClick = () => setIsViewModalOpen(true);
   const handleReviewClick = () => setIsReviewModalOpen(true);
   const handleGenerateOR = () => setIsGenerateORModalOpen(true);

   const handleReviewComplete = () => {
      setIsReviewModalOpen(false);
      onReviewComplete();
   };

   const handleORComplete = () => {
      setIsGenerateORModalOpen(false);
      onReviewComplete();
   };

   const renderActionButtons = () => {
      const actions = [
         {
            icon: Eye,
            label: "View OOP",
            onClick: handleViewClick,
            variant: "outline"
         },

         currentTab === 'Payment Proof' && {
            icon: FileCheck2,
            label: "Review Payment",
            onClick: handleReviewClick,
            variant: "outline",
            className: "text-blue-600 hover:text-blue-800"
         },

         currentTab === 'Completed Payments' && {
            icon: FileText,
            label: "Generate OR",
            onClick: handleGenerateOR,
            variant: "outline",
            className: "text-green-600 hover:text-green-800"
         }
      ].filter(Boolean);

      return actions.map((action, index) => (
         <TooltipProvider key={index}>
            <Tooltip>
               <TooltipTrigger asChild>
                  <Button
                     variant={action.variant}
                     size="icon"
                     onClick={action.onClick}
                     className={action.className}
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
                     <p className="font-medium">{oop.applicationId}</p>
                     <p className="text-sm text-muted-foreground">Bill No: {oop.billNo}</p>
                  </div>
                  <Badge
                     variant={getStatusVariant(oop.OOPstatus).variant}
                     className={getStatusVariant(oop.OOPstatus).className}
                  >
                     {oop.OOPstatus}
                  </Badge>
               </div>
               <p className="text-sm text-muted-foreground">
                  {format(new Date(parseInt(oop.createdAt)), 'MMM d, yyyy')}
               </p>
               <p className="text-sm font-medium">₱ {oop.totalAmount.toFixed(2)}</p>
               <div className="flex gap-2">
                  {renderActionButtons()}
               </div>
            </Card>

            {/* Modals */}
            <ViewOOPModal
               isOpen={isViewModalOpen}
               onClose={() => setIsViewModalOpen(false)}
               oop={oop}
            />
            <ReviewPaymentModal
               isOpen={isReviewModalOpen}
               onClose={() => setIsReviewModalOpen(false)}
               oop={oop}
               onReviewComplete={handleReviewComplete}
            />
            <GenerateORModal
               isOpen={isGenerateORModalOpen}
               onClose={() => setIsGenerateORModalOpen(false)}
               oop={oop}
               onComplete={handleORComplete}
            />
         </>
      );
   }

   return (
      <>
         <TableRow>
            <TableCell>{oop.applicationId}</TableCell>
            <TableCell>{oop.billNo}</TableCell>
            <TableCell>{format(new Date(parseInt(oop.createdAt)), 'MMM d, yyyy')}</TableCell>
            <TableCell>₱ {oop.totalAmount.toFixed(2)}</TableCell>
            <TableCell>
               <Badge
                  variant={getStatusVariant(oop.OOPstatus).variant}
                  className={getStatusVariant(oop.OOPstatus).className}
               >
                  {oop.OOPstatus}
               </Badge>
            </TableCell>
            <TableCell className="text-right">
               <div className="flex justify-end gap-2">
                  {renderActionButtons()}
               </div>
            </TableCell>
         </TableRow>

         {/* Modals */}
         <ViewOOPModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            oop={oop}
         />
         <ReviewPaymentModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            oop={oop}
            onReviewComplete={handleReviewComplete}
         />
         <GenerateORModal
            isOpen={isGenerateORModalOpen}
            onClose={() => setIsGenerateORModalOpen(false)}
            oop={oop}
            onComplete={handleORComplete}
         />
      </>
   );
};

// Helper function to map status to badge variant and custom colors
const getStatusVariant = (status) => {
   switch (status.toLowerCase()) {
      case 'payment proof submitted':
         return {
            variant: 'warning',
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80'
         };
      case 'payment proof approved':
         return {
            variant: 'success',
            className: 'bg-green-100 text-green-800 hover:bg-green-100/80'
         };
      case 'awaiting payment':
         return {
            variant: 'default',
            className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80'
         };
      case 'issued or':
         return {
            variant: 'success',
            className: 'bg-green-100 text-green-800 hover:bg-green-100/80'
         };
      default:
         return {
            variant: 'secondary',
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
         };
   }
};

export default BC_OOPRow;
