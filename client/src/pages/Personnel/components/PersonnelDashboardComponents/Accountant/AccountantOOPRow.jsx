import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Printer, CheckCircle2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import AccountantReviewModal from './AccountantReviewModal';
import ViewOOPModal from '@/pages/user/components/ViewOOPModal';
import { gql } from 'graphql-tag';

const UPDATE_OOP_TRACKING = gql`
  mutation UpdateOOPTracking($id: ID!, $tracking: OOPTrackingInput!) {
    updateOOPTracking(id: $id, tracking: $tracking) {
      _id
      receivedDate
      receivedTime
      trackingNo
      releasedDate
      releasedTime
    }
  }
`;

const GET_OOP = gql`
  query GetOOP($id: ID!) {
    getOOPById(id: $id) {
      _id
      billNo
      applicationId
      date
      namePayee
      address
      natureOfApplication
      items {
        legalBasis
        description
        amount
      }
      totalAmount
      OOPstatus
      OOPSignedByTwoSignatories
      rpsSignatureImage
      tsdSignatureImage
      receivedDate
      receivedTime
      trackingNo
      releasedDate
      releasedTime
      createdAt
      updatedAt
    }
  }
`;

const AccountantOOPRow = ({ oop, onReviewComplete }) => {
   const navigate = useNavigate();
   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [isViewOOPModalOpen, setIsViewOOPModalOpen] = useState(false);

   useEffect(() => {
      console.log('OOP data in AccountantOOPRow:', oop);
   }, [oop]);

   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const handleView = () => {
      setIsViewOOPModalOpen(true);
   };

   const handlePrint = () => {
      navigate('/user/oop-print', { state: { oop } });
   };

   const handleApprove = () => {
      setIsReviewModalOpen(true);
   };

   const handleSendToApplicant = async () => {
      try {
         // Update tracking info when sending to applicant
         await updateOOPTracking({
            variables: {
               id: oop._id,
               tracking: {
                  releasedTime: format(new Date(), 'HH:mm:ss'),
                  // Other tracking fields if needed
               }
            }
         });
         console.log('Tracking updated successfully', tracking);
         console.log('Released time:', tracking.releasedTime);

         await sendORToApplicant({
            variables: { Id: oop._id }
         });

         toast.success('Official Receipt sent to applicant');
         onComplete();
      } catch (error) {
         console.error('Error sending OR:', error);
         toast.error('Failed to send Official Receipt');

      }
   };

   return (
      <>
         <tr key={oop._id}>
            <td className="px-4 py-4 whitespace-nowrap">
               {oop.applicationId}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               {oop.billNo}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               {formatDate(oop.createdAt)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               ₱ {oop.totalAmount.toFixed(2)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${oop.OOPstatus === 'For Approval' ? 'bg-yellow-100 text-yellow-800' :
                  oop.OOPstatus === 'Awaiting Payment' ? 'bg-green-100 text-green-800' :
                     oop.OOPstatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                  }`}>
                  {oop.OOPstatus}
               </span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm">
               <div className="flex items-center space-x-2">
                  <TooltipProvider>
                     <Tooltip delayDuration={250}>
                        <TooltipTrigger asChild>
                           <Button
                              onClick={handleView}
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                           >
                              <Eye className="h-4 w-4 text-black" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>View OOP</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                     <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                           <Button
                              onClick={handlePrint}
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                           >
                              <Printer className="h-4 w-4 text-black" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Print OOP</p>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>

                  {oop.OOPstatus === 'For Approval' && (
                     <TooltipProvider>
                        <Tooltip delayDuration={200}>
                           <TooltipTrigger asChild>
                              <Button
                                 onClick={handleApprove}
                                 variant="outline"
                                 size="icon"
                                 className="h-8 w-8 text-green-600 hover:text-green-800"
                              >
                                 <CheckCircle2 className="h-4 w-4" />
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                              <p>Approve OOP</p>
                           </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                  )}
               </div>
            </td>
         </tr>

         <ViewOOPModal
            isOpen={isViewOOPModalOpen}
            onClose={() => setIsViewOOPModalOpen(false)}
            oop={oop}
         />

         <AccountantReviewModal
            oop={oop}
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onReviewComplete={onReviewComplete}
         />
      </>
   );
};

export default AccountantOOPRow;
