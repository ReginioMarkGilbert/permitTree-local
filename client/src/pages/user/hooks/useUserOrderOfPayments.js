import { useQuery, gql, useApolloClient } from '@apollo/client';

const GET_USER_OOPS = gql`
  query GetOOPsByUserId($userId: ID!, $status: String) {
    getOOPsByUserId(userId: $userId, status: $status) {
      _id
      billNo
      applicationId
      applicationNumber
      namePayee
      address
      natureOfApplication
      totalAmount
      OOPstatus
      createdAt
      items {
        legalBasis
        description
        amount
      }
      rpsSignatureImage
      tsdSignatureImage
      receivedDate
      receivedTime
      trackingNo
      releasedDate
      releasedTime
      paymentProof {
        transactionId
        paymentMethod
        amount
        timestamp
        referenceNumber
        payerDetails {
          name
          email
          phoneNumber
        }
        status
      }
      officialReceipt {
        orNumber
        dateIssued
        amount
        paymentMethod
        remarks
      }
    }
  }
`;

export const useUserOrderOfPayments = (userId, status) => {
   const client = useApolloClient();
   const { data, loading, error, refetch } = useQuery(GET_USER_OOPS, {
      variables: { userId, status },
      skip: !userId,
      fetchPolicy: 'network-only',
      pollInterval: 5000 // Poll every 5 seconds
   });

   return {
      oops: data?.getOOPsByUserId || [],
      loading,
      error,
      refetch
   };
};
