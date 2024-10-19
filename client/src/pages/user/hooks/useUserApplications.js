import { useQuery, useMutation, gql } from '@apollo/client';

const GET_USER_APPLICATIONS = gql`
  query GetUserApplications($status: String) {
    getUserApplications(status: $status) {
      id
      applicationNumber
      applicationType
      status
      dateOfSubmission
      ... on CSAWPermit {
        registrationType
        chainsawStore
        ownerName
        address
        phone
        brand
        model
        serialNumber
        dateOfAcquisition
        powerOutput
        maxLengthGuidebar
        countryOfOrigin
        purchasePrice
        isOwner
        isTenureHolder
        isBusinessOwner
        isPLTPRHolder
        isWPPHolder
        files {
          officialReceipt { filename contentType }
          deedOfSale { filename contentType }
          specialPowerOfAttorney { filename contentType }
          forestTenureAgreement { filename contentType }
          businessPermit { filename contentType }
          certificateOfRegistration { filename contentType }
          woodProcessingPlantPermit { filename contentType }
        }
      }
      # ... (other permit types)
    }
  }
`;

const DELETE_PERMIT = gql`
  mutation DeletePermit($id: ID!) {
    deletePermit(id: $id)
  }
`;

const UPDATE_COV_PERMIT = gql`
  mutation UpdateCOVPermit($id: ID!, $input: COVPermitInput!) {
    updateCOVPermit(id: $id, input: $input) {
      id
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
  const [updateCOVPermitMutation] = useMutation(UPDATE_COV_PERMIT);

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

  const updateCOVPermit = async (id, input) => {
    console.log('Updating COV permit:', id);
    console.log('Update input:', input);
    try {
      // Process files, including removals
      const updatedFiles = {};
      if (input.files) {
        Object.entries(input.files).forEach(([key, value]) => {
          if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
            updatedFiles[key] = []; // Send an empty array to indicate file removal
          } else if (Array.isArray(value) && value.length > 0) {
            updatedFiles[key] = value.map(file => ({
              filename: file.filename,
              contentType: file.contentType,
              data: file.data || '' // Only include data if it's present
            }));
          }
        });
      }

      const { data } = await updateCOVPermitMutation({
        variables: {
          id,
          input: {
            name: input.name,
            address: input.address,
            cellphone: input.cellphone,
            purpose: input.purpose,
            driverName: input.driverName,
            driverLicenseNumber: input.driverLicenseNumber,
            vehiclePlateNumber: input.vehiclePlateNumber,
            originAddress: input.originAddress,
            destinationAddress: input.destinationAddress,
            files: updatedFiles
          }
        },
        refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status: input.status } }]
      });
      console.log('Update mutation result:', data);
      if (data.updateCOVPermit) {
        return data.updateCOVPermit;
      } else {
        throw new Error('Failed to update permit');
      }
    } catch (error) {
      console.error('Error updating permit:', error);
      throw error;
    }
  };

  console.log('useUserApplications returning. Applications:', data?.getUserApplications);

  return {
    applications: data?.getUserApplications || [],
    loading,
    error,
    refetch,
    deletePermit,
    updateCOVPermit
  };
};
