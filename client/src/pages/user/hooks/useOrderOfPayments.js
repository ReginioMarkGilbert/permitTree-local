import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

const GET_USER_OOPS = gql`
  query GetUserOOPs($OOPstatus: String) {
    getUserOOPs(OOPstatus: $OOPstatus) {
      _id
      billNo
      applicationId
      totalAmount
      OOPstatus
      createdAt
    }
  }
`;

export const useOrderOfPayments = () => {
  const { loading, error, data, refetch } = useQuery(GET_USER_OOPS, {
    variables: { OOPstatus: null },
    fetchPolicy: 'network-only',
  });

  const fetchUserOOPs = (OOPstatus) => {
    refetch({ OOPstatus });
  };

  return {
    oops: data?.getUserOOPs || [],
    loading,
    error,
    fetchUserOOPs,
    refetch,
  };
};
