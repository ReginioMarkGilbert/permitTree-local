import { useQuery, useMutation, gql } from '@apollo/client';

const GET_APPLICATIONS = gql`
  query GetApplicationsByStatus(
    $status: String
    $currentStage: String
    $approvedByTechnicalStaff: Boolean
    $acceptedByTechnicalStaff: Boolean
    $acceptedByReceivingClerk: Boolean
    $recordedByReceivingClerk: Boolean
    $reviewedByChief: Boolean
    $awaitingOOP: Boolean
    $awaitingPermitCreation: Boolean
    $PermitCreated: Boolean
  ) {
    getApplicationsByStatus(
      status: $status
      currentStage: $currentStage
      approvedByTechnicalStaff: $approvedByTechnicalStaff
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff
      acceptedByReceivingClerk: $acceptedByReceivingClerk
      recordedByReceivingClerk: $recordedByReceivingClerk
      reviewedByChief: $reviewedByChief
      awaitingOOP: $awaitingOOP
      awaitingPermitCreation: $awaitingPermitCreation
      PermitCreated: $PermitCreated
    ) {
      ... on CSAWPermit {
        id
        applicationNumber
        applicationType
        registrationType
        ownerName
        address
        brand
        model
        serialNumber
        dateOfAcquisition
        powerOutput
        maxLengthGuidebar
        countryOfOrigin
        purchasePrice
        status
        currentStage
        dateOfSubmission
        acceptedByTechnicalStaff
        approvedByTechnicalStaff
        acceptedByReceivingClerk
        recordedByReceivingClerk
        reviewedByChief
        awaitingOOP
        OOPCreated
        awaitingPermitCreation
        PermitCreated
      }
      ... on Permit {
        id
        applicationNumber
        applicationType
        status
        currentStage
        dateOfSubmission
        acceptedByTechnicalStaff
        approvedByTechnicalStaff
        acceptedByReceivingClerk
        recordedByReceivingClerk
        reviewedByChief
        awaitingOOP
        OOPCreated
        awaitingPermitCreation
        PermitCreated
      }
    }
  }
`;

const UNDO_APPROVAL = gql`
  mutation UndoApproval($id: ID!) {
    undoApproval(id: $id) {
      id
      status
      currentStage
    }
  }
`;

export const useApplications = (params = {}) => {
   const { data, loading, error, refetch } = useQuery(GET_APPLICATIONS, {
      variables: params,
      fetchPolicy: 'network-only'
   });

   return {
      applications: data?.getApplicationsByStatus || [],
      loading,
      error,
      refetch
   };
};

export const useUndoApplicationApproval = () => {
   const [undoApproval] = useMutation(UNDO_APPROVAL);

   const handleUndoApproval = async (id) => {
      try {
         const { data } = await undoApproval({
            variables: { id }
         });
         return data.undoApproval;
      } catch (error) {
         console.error('Error undoing approval:', error);
         throw error;
      }
   };

   return { handleUndoApproval };
};
