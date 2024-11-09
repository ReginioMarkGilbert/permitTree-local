import { useQuery, gql } from '@apollo/client';

const GET_USER_OOPS = gql`
  query GetOOPsByUserId($userId: ID!, $status: String) {
    getOOPsByUserId(userId: $userId, status: $status) {
      _id
      billNo
      applicationId
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
  const { data, loading, error, refetch } = useQuery(GET_USER_OOPS, {
    variables: { userId, status },
    skip: !userId,
    fetchPolicy: 'network-only'
  });

  return {
    oops: data?.getOOPsByUserId || [],
    loading,
    error,
    refetch
  };
};
