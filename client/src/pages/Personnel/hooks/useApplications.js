import { useQuery, gql } from '@apollo/client';

const GET_APPLICATIONS_BY_STATUS = gql`
  query GetApplicationsByStatus($status: String!) {
    getApplicationsByStatus(status: $status) {
      id
      applicationNumber
      applicationType
      status
      dateOfSubmission
    }
  }
`;

export const useApplications = (status) => {
  const { data, loading, error, refetch } = useQuery(GET_APPLICATIONS_BY_STATUS, {
    variables: { status },
    fetchPolicy: 'network-only',
  });

  const fetchApplications = async () => {
    await refetch();
    return data?.getApplicationsByStatus || [];
  };

  return {
    applications: data?.getApplicationsByStatus || [],
    loading,
    error,
    fetchApplications
  };
};
