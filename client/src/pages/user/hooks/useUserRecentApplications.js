import { gql, useQuery, useApolloClient } from '@apollo/client';

const GET_RECENT_APPLICATIONS = gql`
  query GetRecentApplications($limit: Int!) {
    getRecentApplications(limit: $limit) {
      ... on CSAWPermit {
        id
        applicationNumber
        applicationType
        status
        dateOfSubmission
      }
      ... on COVPermit {
        id
        applicationNumber
        applicationType
        status
        dateOfSubmission
      }
      ... on PLTCPPermit {
        id
        applicationNumber
        applicationType
        status
        dateOfSubmission
      }
      ... on PTPRPermit {
        id
        applicationNumber
        applicationType
        status
        dateOfSubmission
      }
      ... on PLTPPermit {
        id
        applicationNumber
        applicationType
        status
        dateOfSubmission
      }
      ... on TCEBPPermit {
        id
        applicationNumber
        applicationType
        status
        dateOfSubmission
      }
    }
  }
`;

export const useRecentApplications = (limit = 5) => {
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(GET_RECENT_APPLICATIONS, {
    variables: { limit: limit || 5 },
    fetchPolicy: 'network-only'
  });

  return {
    recentApplications: data?.getRecentApplications || [],
    loading,
    error,
    refetch
  };
};
