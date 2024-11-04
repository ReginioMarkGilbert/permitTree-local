import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useEffect } from 'react';

// Queries
export const GET_APPLICATIONS_AWAITING_OOP = gql`
  query GetApplicationsByStatus($awaitingOOP: Boolean) {
    getApplicationsByStatus(awaitingOOP: $awaitingOOP) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      awaitingOOP
      ... on CSAWPermit {
        ownerName
        address
      }
      ... on COVPermit {
        name
        address
      }
      ... on PTPRPermit {
        ownerName
        address
      }
      ... on PLTCPPermit {
        name
        address
      }
      ... on PLTPPermit {
        name
        address
      }
      ... on TCEBPPermit {
        name
        address
      }
    }
  }
`;

export const GET_OOP = gql`
  query GetOOP($id: ID!) {
    getOOPById(id: $id) {
      _id
      billNo
      applicationId
      date
      namePayee
      address
      natureOfApplication
      items {
        legalBasis
        description
        amount
      }
      totalAmount
      status
      signatures {
        chiefRPS
        technicalServices
      }
      rpsSignatureImage
      tsdSignatureImage
    }
  }
`;

// Mutations
const CREATE_OOP = gql`
  mutation CreateOOP($input: OOPInput!) {
    createOOP(input: $input) {
      _id
      billNo
      applicationId
      status
    }
  }
`;

const UPDATE_OOP_SIGNATURE = gql`
  mutation UpdateOOPSignature($id: ID!, $signatureType: String!, $signatureImage: String!) {
    updateOOPSignature(id: $id, signatureType: $signatureType, signatureImage: $signatureImage) {
      _id
      status
      signatures {
        chiefRPS
        technicalServices
      }
      rpsSignatureImage
      tsdSignatureImage
    }
  }
`;

export const useOrderOfPayments = () => {
  // Query with variable
  const {
    data: applicationsData,
    loading: applicationsLoading,
    error: applicationsError,
    refetch
  } = useQuery(GET_APPLICATIONS_AWAITING_OOP, {
    variables: { awaitingOOP: true },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('Received applications data:', data);
      if (data?.getApplicationsByStatus) {
        console.log('Number of applications:', data.getApplicationsByStatus.length);
        data.getApplicationsByStatus.forEach(app => {
          console.log('Application:', {
            id: app.id,
            number: app.applicationNumber,
            type: app.applicationType,
            name: app.ownerName || app.name
          });
        });
      }
    },
    onError: (error) => {
      console.error('Query error:', error);
    }
  });

  // Log whenever applications change
  useEffect(() => {
    console.log('Current applications:', applicationsData?.getApplicationsByStatus);
  }, [applicationsData]);

  // Mutations
  const [createOOP] = useMutation(CREATE_OOP);
  const [updateSignature] = useMutation(UPDATE_OOP_SIGNATURE);

  const handleCreateOOP = async (oopData) => {
    try {
      const { data } = await createOOP({
        variables: {
          input: {
            applicationId: oopData.applicationId,
            namePayee: oopData.namePayee,
            address: oopData.address,
            natureOfApplication: oopData.natureOfApplication,
            items: oopData.fees.map(fee => ({
              legalBasis: fee.legalBasis,
              description: fee.description,
              amount: parseFloat(fee.amount)
            })),
            rpsSignatureImage: oopData.rpsSignature || null,
            tsdSignatureImage: oopData.tsdSignature || null
          }
        },
        refetchQueries: [{
          query: GET_APPLICATIONS_AWAITING_OOP,
          variables: { awaitingOOP: true }
        }]
      });
      return data.createOOP;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleUpdateSignature = async (oopId, signatureType, signatureImage) => {
    try {
      const { data } = await updateSignature({
        variables: {
          id: oopId,
          signatureType,
          signatureImage
        }
      });
      return data.updateOOPSignature;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return {
    applications: applicationsData?.getApplicationsByStatus || [],
    applicationsLoading,
    applicationsError,
    refetch,
    createOOP: handleCreateOOP,
    updateSignature: handleUpdateSignature
  };
};
