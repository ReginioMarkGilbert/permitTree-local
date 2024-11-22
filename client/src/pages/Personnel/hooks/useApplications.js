import { useQuery, useMutation, gql } from '@apollo/client';

const GET_APPLICATIONS = gql`
  query GetApplicationsByStatus(
    $status: String
    $currentStage: String
    $approvedByTechnicalStaff: Boolean
    $acceptedByTechnicalStaff: Boolean

    $acceptedByReceivingClerk: Boolean
    $recordedByReceivingClerk: Boolean

    $acceptedByPENRCENROfficer: Boolean
    $approvedByPENRCENROfficer: Boolean

    $reviewedByChief: Boolean

    $awaitingOOP: Boolean
    $OOPCreated: Boolean

   #  $hasInspectionReport: Boolean
    $InspectionReportsReviewedByChief: Boolean
    $InspectionReportsReviewedByPENRCENROfficer: Boolean

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

      acceptedByPENRCENROfficer: $acceptedByPENRCENROfficer
      approvedByPENRCENROfficer: $approvedByPENRCENROfficer

      reviewedByChief: $reviewedByChief

      awaitingOOP: $awaitingOOP
      OOPCreated: $OOPCreated

      # hasInspectionReport: $hasInspectionReport
      InspectionReportsReviewedByChief: $InspectionReportsReviewedByChief
      InspectionReportsReviewedByPENRCENROfficer: $InspectionReportsReviewedByPENRCENROfficer

      awaitingPermitCreation: $awaitingPermitCreation
      PermitCreated: $PermitCreated
    ) {
      ... on CSAWPermit {
        id
        applicationNumber
        applicationType
        status
        currentStage
        dateOfSubmission
      }
      ... on COVPermit {
        id
        applicationNumber
        applicationType
        status
        currentStage
        dateOfSubmission
      }
      ... on PTPRPermit {
        id
        applicationNumber
        applicationType
        status
        currentStage
        dateOfSubmission
      }
      ... on PLTCPPermit {
        id
        applicationNumber
        applicationType
        status
        currentStage
        dateOfSubmission
      }
      ... on PLTPPermit {
        id
        applicationNumber
        applicationType
        status
        currentStage
        dateOfSubmission
      }
      ... on TCEBPPermit {
        id
        applicationNumber
        applicationType
        status
        currentStage
        dateOfSubmission
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
