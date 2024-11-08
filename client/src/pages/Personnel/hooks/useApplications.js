import { useQuery, gql, useMutation } from '@apollo/client';

// to add a new query param, add it first to the type, then to the query, then to the variables, then to the fetchApplications function
// files: server/src/schema/permitTypes.js : type Query,
// server/src/resolvers/permitResolvers/permitResolvers.js: getApplicationsByStatus & updatePermitStage,
// client/src/pages/Personnel/hooks/useApplications.js: GET_APPLICATIONS

const GET_APPLICATIONS = gql`
  query GetApplications(
    $status: String,
    $currentStage: String,
    $acceptedByTechnicalStaff: Boolean,
    $approvedByTechnicalStaff: Boolean,
    $acceptedByReceivingClerk: Boolean,
    $recordedByReceivingClerk: Boolean,
    $reviewedByChief: Boolean,
    $awaitingOOP: Boolean,
    $awaitingPermitCreation: Boolean,
    $PermitCreated: Boolean
  ) {
    getApplicationsByStatus(
      status: $status,
      currentStage: $currentStage,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff,
      approvedByTechnicalStaff: $approvedByTechnicalStaff,
      acceptedByReceivingClerk: $acceptedByReceivingClerk,
      recordedByReceivingClerk: $recordedByReceivingClerk,
      reviewedByChief: $reviewedByChief,
      awaitingOOP: $awaitingOOP,
      awaitingPermitCreation: $awaitingPermitCreation,
      PermitCreated: $PermitCreated
    ) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      acceptedByTechnicalStaff
      approvedByTechnicalStaff
      acceptedByReceivingClerk
      recordedByReceivingClerk
      reviewedByChief
      awaitingOOP
      awaitingPermitCreation
      PermitCreated
      dateOfSubmission
      history {
        notes
        timestamp
      }
    }
  }
`;

const UNDO_APPROVAL_MUTATION = gql`
  mutation UndoApplicationApproval($id: ID!) {
    updatePermitStage(
      id: $id
      currentStage: "ForInspectionByTechnicalStaff"
      status: "In Progress"
      approvedByTechnicalStaff: false
    ) {
      id
      status
      currentStage
      approvedByTechnicalStaff
    }
  }
`;

export const useApplications = ({ status, currentStage, acceptedByTechnicalStaff, approvedByTechnicalStaff, acceptedByReceivingClerk, recordedByReceivingClerk, reviewedByChief, awaitingOOP, awaitingPermitCreation, PermitCreated }) => {
   const { data, loading, error, refetch } = useQuery(GET_APPLICATIONS, {
      variables: {
         status,
         currentStage,
         acceptedByTechnicalStaff,
         approvedByTechnicalStaff,
         acceptedByReceivingClerk,
         recordedByReceivingClerk,
         reviewedByChief,
         awaitingOOP,
         awaitingPermitCreation,
         PermitCreated
      },
      fetchPolicy: 'network-only',
   });

   const fetchApplications = async () => {
      try {
         const result = await refetch();
         return result.data?.getApplicationsByStatus || [];
      } catch (refetchError) {
         console.error('Client: Error refetching applications:', refetchError);
         return [];
      }
   };

   return {
      applications: data?.getApplicationsByStatus || [],
      loading,
      error,
      fetchApplications
   };
};

export const useUndoApplicationApproval = () => {
  const [undoApproval] = useMutation(UNDO_APPROVAL_MUTATION);

  const handleUndoApproval = async (id) => {
    try {
      await undoApproval({
        variables: { id }
      });
      return true;
    } catch (error) {
      console.error('Error undoing approval:', error);
      throw error;
    }
  };

  return { handleUndoApproval };
};
