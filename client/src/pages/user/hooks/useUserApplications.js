import { useQuery, useMutation, gql } from '@apollo/client';

const GET_USER_APPLICATIONS = gql`
  query GetUserApplications($status: String) {
    getUserApplications(status: $status) {
      id
      applicationNumber
      applicationType
      status
      dateOfSubmission
      ... on COVPermit {
        name
        address
        cellphone
        purpose
        driverName
        driverLicenseNumber
        vehiclePlateNumber
        originAddress
        destinationAddress
      }
      ... on CSAWPermit {
        ownerName
        address
        phone
      }
      ... on PLTPPermit {
        name
        address
        contactNumber
        purpose
      }
      ... on PTPRPermit {
        ownerName
        address
        contactNumber
      }
      ... on SPLTPPermit {
        name
        address
        contactNumber
        purpose
      }
      ... on TCEBPPermit {
        name
        address
        contactNumber
        purpose
      }
    }
  }
`;

const DELETE_PERMIT = gql`
  mutation DeletePermit($id: ID!) {
    deletePermit(id: $id)
  }
`;

export const useUserApplications = (status) => {
  console.log('useUserApplications called with status:', status);

  const { loading, error, data, refetch } = useQuery(GET_USER_APPLICATIONS, {
    variables: { status },
    fetchPolicy: 'network-only',
    onCompleted: (data) => console.log('Query completed. Data:', data),
    onError: (error) => console.error('Query error:', error),
  });

  const [deletePermitMutation] = useMutation(DELETE_PERMIT);

  const deletePermit = async (id) => {
    console.log('Attempting to delete permit with id:', id);
    try {
      const { data } = await deletePermitMutation({
        variables: { id },
        refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status } }]
      });
      console.log('Delete mutation result:', data);
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

  console.log('useUserApplications returning. Applications:', data?.getUserApplications);

  return {
    applications: data?.getUserApplications || [],
    loading,
    error,
    refetch,
    deletePermit
  };
};
