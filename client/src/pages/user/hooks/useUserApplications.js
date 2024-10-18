import { useQuery, gql } from '@apollo/client';

const GET_USER_APPLICATIONS = gql`
  query GetUserApplications($status: String) {
    getUserApplications(status: $status) {
      id
      applicationNumber
      applicationType
      status
      dateOfSubmission
    }
  }
`;

export const useUserApplications = (status) => {
  const { loading, error, data, refetch } = useQuery(GET_USER_APPLICATIONS, {
    variables: { status },
    fetchPolicy: 'network-only',
  });

  return {
    applications: data?.getUserApplications || [],
    loading,
    error,
    refetch,
  };
};
