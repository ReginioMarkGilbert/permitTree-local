import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Printer, FileCheck2, Send } from "lucide-react";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'sonner';

const FORWARD_CERTIFICATE = gql`
  mutation ForwardCertificateForSignature($id: ID!) {
    forwardCertificateForSignature(id: $id) {
      id
      certificateStatus
    }
  }
`;

const TS_CertificateRow = ({ certificate, onViewClick, onReviewComplete }) => {
   const [forwardCertificate] = useMutation(FORWARD_CERTIFICATE);

   const formatDate = (dateString) => {
      try {
         return format(new Date(dateString), 'MM/dd/yyyy');
      } catch (error) {
         console.error('Error formatting date:', error);
         return 'Invalid Date';
      }
   };

   const handleForward = async () => {
      try {
         await forwardCertificate({
            variables: {
               id: certificate.id
            }
         });
         toast.success('Certificate forwarded for signature');
         if (onReviewComplete) onReviewComplete();
      } catch (error) {
         console.error('Error forwarding certificate:', error);
         toast.error('Failed to forward certificate');
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'Pending Signature':
            return 'bg-yellow-100 text-yellow-800';
         case 'Complete Signatures':
            return 'bg-green-100 text-green-800';
         case 'Released':
            return 'bg-blue-100 text-blue-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   return (
      <tr key={certificate.id}>
         <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">{certificate.certificateNumber}</div>
         </td>
         <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">{certificate.applicationType}</div>
         </td>
         <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm text-gray-900">
               {formatDate(certificate.dateCreated)}
            </div>
         </td>
         <td className="px-4 py-3 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(certificate.certificateStatus)}`}>
               {certificate.certificateStatus}
            </span>
         </td>
         <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
            <div className="flex items-center space-x-2">
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           onClick={() => onViewClick(certificate)}
                        >
                           <Eye className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                        <p>View Certificate</p>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>

               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           onClick={() => window.print()}
                        >
                           <Printer className="h-4 w-4" />
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                        <p>Print Certificate</p>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>

               {certificate.certificateStatus === 'Pending Signature' && (
                  <TooltipProvider>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-blue-600"
                              onClick={handleForward}
                           >
                              <Send className="h-4 w-4" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Forward for Signature</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>
               )}
            </div>
         </td>
      </tr>
   );
};

export default TS_CertificateRow;
