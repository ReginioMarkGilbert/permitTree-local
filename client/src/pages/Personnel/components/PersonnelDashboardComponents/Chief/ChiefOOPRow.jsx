import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Printer, PenLine, RotateCcw } from "lucide-react";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import OOPAffixEsignModal from '../../OOPAffixEsignModal';
import ViewOOPModal from '@/pages/user/components/ViewOOPModal';
import { useMutation, gql, useQuery } from '@apollo/client';
import { toast } from 'sonner';

const GET_PERMIT_BY_APPLICATION_NUMBER = gql`
  query GetPermitByApplicationNumber($applicationNumber: String!) {
    getPermitByApplicationNumber(applicationNumber: $applicationNumber) {
      id
      applicationNumber
    }
  }
`;

const DELETE_OOP = gql`
  mutation DeleteOOP($applicationId: String!) {
    deleteOOP(applicationId: $applicationId) {
      _id
      applicationId
    }
  }
`;

const UNDO_OOP_CREATION = gql`
  mutation UndoOOPCreation($id: ID!) {
    undoOOPCreation(id: $id) {
      id
      status
      currentStage
      OOPCreated
      awaitingOOP
    }
  }
`;

const GET_OOP = gql`
  query GetOOP($id: ID!) {
    getOOPById(id: $id) {
      _id
      billNo
      applicationId
      applicationNumber
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
      tracking {
        receivedDate
        receivedTime
        trackingNo
        releasedDate
        releasedTime
      }
      createdAt
      updatedAt
    }
  }
`;

const ChiefOOPRow = ({ oop, onRefetch }) => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [deleteOOP] = useMutation(DELETE_OOP);
   const [undoOOPCreation] = useMutation(UNDO_OOP_CREATION);
   const [isViewOOPModalOpen, setIsViewOOPModalOpen] = useState(false);

   const { data: permitData } = useQuery(GET_PERMIT_BY_APPLICATION_NUMBER, {
      variables: { applicationNumber: oop.applicationId },
      fetchPolicy: 'network-only'
   });
   // the right way to format date
   const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp));
      return format(date, 'M/d/yyyy');
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'Pending Signature':
            return 'bg-yellow-100 text-yellow-800';
         case 'For Approval':
            return 'bg-purple-100 text-purple-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   const handleView = () => {
      setIsViewOOPModalOpen(true);
   };

   const handlePrint = () => {
      console.log('Print OOP:', oop._id);
   };

   const handleAffixSign = () => {
      setIsModalOpen(true);
   };

   const handleUndoOOP = async () => {
      try {
         if (!permitData?.getPermitByApplicationNumber?.id) {
            throw new Error('Could not find permit ID');
         }

         // First, delete the OOP document
         await deleteOOP({
            variables: {
               applicationId: oop.applicationId
            }
         });

         // Then, update the permit status using the actual permit ID
         await undoOOPCreation({
            variables: {
               id: permitData.getPermitByApplicationNumber.id
            }
         });

         toast.success('OOP creation undone successfully');
         if (onRefetch) onRefetch(); // Refresh the list
      } catch (error) {
         console.error('Error undoing OOP creation:', error);
         toast.error('Failed to undo OOP creation');
      }
   };

   return (
      <>
         <tr key={oop._id}>
            <td className="px-4 py-4 whitespace-nowrap">
               {oop.applicationNumber || 'No application number'}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               {oop.billNo}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               {formatDate(oop.createdAt)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(oop.OOPstatus)}`}>
                  {oop.OOPstatus}
               </span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm">
               <div className="flex items-center space-x-2">
                  <TooltipProvider>
                     <Tooltip delayDuration={200}>
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

                  {oop.OOPstatus === 'Pending Signature' && (
                     <>
                        <TooltipProvider>
                           <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                 <Button
                                    onClick={handleAffixSign}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-800"
                                 >
                                    <PenLine className="h-4 w-4" />
                                 </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                 <p>Affix E-Sign</p>
                              </TooltipContent>
                           </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                           <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                 <Button
                                    onClick={handleUndoOOP}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-yellow-600 hover:text-yellow-800"
                                 >
                                    <RotateCcw className="h-4 w-4" />
                                 </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                 <p>Undo OOP Creation</p>
                              </TooltipContent>
                           </Tooltip>
                        </TooltipProvider>
                     </>
                  )}
               </div>
            </td>
         </tr>

         <OOPAffixEsignModal
            oop={oop}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
         />

         <ViewOOPModal
            isOpen={isViewOOPModalOpen}
            onClose={() => setIsViewOOPModalOpen(false)}
            oop={oop}
         />
      </>
   );
};

export default ChiefOOPRow;
