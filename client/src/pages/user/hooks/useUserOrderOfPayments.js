import { useQuery } from '@apollo/client';
import { GET_USER_OOPS } from '../../Personnel/hooks/useOrderOfPayments';

export const useUserOrderOfPayments = (userId, status) => {
   const {
      data,
      loading,
      error,
      refetch
   } = useQuery(GET_USER_OOPS, {
      variables: { userId },
      skip: !userId,
      fetchPolicy: 'network-only'
   });

   // Map frontend status to backend status if needed
   const mapStatus = (frontendStatus) => {
      switch (frontendStatus) {
         case 'Awaiting Payment':
            return 'Awaiting Payment';
         case 'Payment Proof Submitted':
            return 'Payment Proof Submitted';
         case 'Payment Proof Approved':
            return 'Payment Proof Approved';
         case 'Payment Proof Rejected':
            return 'Payment Proof Rejected';
         case 'Issued OR':
            return 'Issued OR';
         case 'Completed':
            return 'Completed OOP';
         default:
            return frontendStatus;
      }
   };

   // Get all OOPs first
   const oops = data?.getOOPsByUserId || [];

   // Filter OOPs based on status if provided
   const filteredOOPs = status
      ? oops.filter(oop => oop.OOPstatus === mapStatus(status))
      : oops;

   return {
      oops: filteredOOPs,
      loading,
      error,
      refetch
   };
};
