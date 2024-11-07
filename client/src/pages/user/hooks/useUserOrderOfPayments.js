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

   // Filter OOPs based on status if provided
   const oops = data?.getOOPsByUserId || [];
   const filteredOOPs = status && oops.length > 0
      ? oops.filter(oop => oop.OOPstatus === status)
      : oops;

   return {
      oops: filteredOOPs,
      loading,
      error,
      refetch
   };
};
