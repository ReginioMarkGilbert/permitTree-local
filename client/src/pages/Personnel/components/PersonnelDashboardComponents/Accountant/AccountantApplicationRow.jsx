import React, { useState } from 'react';
import { Eye, FileCheck2 } from 'lucide-react';
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
import ViewApplicationModal from '@/components/ui/ApplicationDetailsModal';
import OrderOfPaymentForm from '../../OrderOfPaymentForm';
import { toast } from 'sonner';

const AccountantApplicationRow = ({ app, onReviewComplete, currentTab, isMobile }) => {
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isOOPFormOpen, setIsOOPFormOpen] = useState(false);

   const handleViewClick = () => setIsViewModalOpen(true);
   const handleCreateOOP = () => setIsOOPFormOpen(true);

   const handleOOPComplete = () => {
      setIsOOPFormOpen(false);
      toast.success('Order of Payment created successfully');
      onReviewComplete();
   };

   const renderActionButtons = () => {
      const actions = [
         {
            icon: Eye,
            label: "View Application",
            onClick: handleViewClick,
            variant: "outline"
         },
         // Add OOP creation action if applicable
         currentTab === 'Awaiting OOP' && {
            icon: FileCheck2,
            label: "Create Order of Payment",
            onClick: handleCreateOOP,
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
                     <p className="font-medium">{app.applicationNumber}</p>
                     <p className="text-sm text-muted-foreground">{app.applicationType}</p>
                  </div>
                  <Badge
                     variant={getStatusVariant(app.status).variant}
                     className={getStatusVariant(app.status).className}
                  >
                     {app.status}
                  </Badge>
               </div>
               <p className="text-sm text-muted-foreground">
                  {format(new Date(app.dateOfSubmission), 'MMM d, yyyy')}
               </p>
               <div className="flex gap-2">
                  {renderActionButtons()}
               </div>
            </Card>

            {/* Modals */}
            <ViewApplicationModal
               isOpen={isViewModalOpen}
               onClose={() => setIsViewModalOpen(false)}
               application={app}
            />
            <OrderOfPaymentForm
               isOpen={isOOPFormOpen}
               onClose={() => setIsOOPFormOpen(false)}
               application={app}
               onComplete={handleOOPComplete}
            />
         </>
      );
   }

   return (
      <>
         <TableRow>
            <TableCell>{app.applicationNumber}</TableCell>
            <TableCell>{app.applicationType}</TableCell>
            <TableCell>{format(new Date(app.dateOfSubmission), 'MMM d, yyyy')}</TableCell>
            <TableCell>
               <Badge
                  variant={getStatusVariant(app.status).variant}
                  className={getStatusVariant(app.status).className}
               >
                  {app.status}
               </Badge>
            </TableCell>
            <TableCell className="text-right">
               <div className="flex justify-end gap-2">
                  {renderActionButtons()}
               </div>
            </TableCell>
         </TableRow>

         {/* Modals */}
         <ViewApplicationModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            application={app}
         />
         <OrderOfPaymentForm
            isOpen={isOOPFormOpen}
            onClose={() => setIsOOPFormOpen(false)}
            application={app}
            onComplete={handleOOPComplete}
         />
      </>
   );
};

// Helper function to map status to badge variant and custom colors
const getStatusVariant = (status) => {
   switch (status.toLowerCase()) {
      case 'submitted':
         return {
            variant: 'default',
            className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80'
         };
      case 'approved':
         return {
            variant: 'success',
            className: 'bg-green-100 text-green-800 hover:bg-green-100/80'
         };
      case 'awaiting oop':
         return {
            variant: 'warning',
            className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80'
         };
      default:
         return {
            variant: 'secondary',
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
         };
   }
};

export default AccountantApplicationRow;
