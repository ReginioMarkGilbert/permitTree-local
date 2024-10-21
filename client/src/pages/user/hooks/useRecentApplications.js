import { useQuery, gql } from '@apollo/client';

const GET_RECENT_APPLICATIONS = gql`
  query GetRecentApplications($limit: Int!) {
    getRecentApplications(limit: $limit) {
      id
      applicationNumber
      applicationType
      status
      dateOfSubmission
    }
  }
`;

export const useRecentApplications = (limit = 7) => {
  const { loading, error, data, refetch } = useQuery(GET_RECENT_APPLICATIONS, {
    variables: { limit },
    fetchPolicy: 'network-only',
  });

  return {
    recentApplications: data?.getRecentApplications || [],
    loading,
    error,
    refetch,
  };
};
