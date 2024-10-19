import { useQuery, useMutation, gql } from '@apollo/client';

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

const DELETE_PERMIT = gql`
  mutation DeletePermit($id: ID!) {
    deletePermit(id: $id)
  }
`;

export const useUserApplications = (status) => {
  const { loading, error, data, refetch } = useQuery(GET_USER_APPLICATIONS, {
    variables: { status },
    fetchPolicy: 'network-only',
  });

  const [deletePermitMutation] = useMutation(DELETE_PERMIT);

  const deletePermit = async (id) => {
    try {
      const { data } = await deletePermitMutation({
        variables: { id },
        refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status } }]
      });
      if (data.deletePermit) {
        return true;
      } else {
        throw new Error('Failed to delete permit');
      }
    } catch (error) {
      console.error('Error deleting permit:', error);
      throw error;
    }
  };

  return {
    applications: data?.getUserApplications || [],
    loading,
    error,
    refetch,
    deletePermit
  };
};
