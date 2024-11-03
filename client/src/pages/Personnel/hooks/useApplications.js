import { useQuery, gql } from '@apollo/client';

// to add a new query param, add it first to the type, then to the query, then to the variables, then to the fetchApplications function
// files: server/src/schema/permitTypes.js : type Query,
// server/src/resolvers/permitResolvers/permitResolvers.js: getApplicationsByStatus,
// client/src/pages/Personnel/hooks/useApplications.js: GET_APPLICATIONS

const GET_APPLICATIONS = gql`
  query GetApplications(
    $status: String,
    $currentStage: String,
    $acceptedByTechnicalStaff: Boolean,
    $acceptedByReceivingClerk: Boolean,
    $recordedByReceivingClerk: Boolean,
    $reviewedByChief: Boolean
  ) {
    getApplicationsByStatus(
      status: $status,
      currentStage: $currentStage,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff,
      acceptedByReceivingClerk: $acceptedByReceivingClerk,
      recordedByReceivingClerk: $recordedByReceivingClerk,
      reviewedByChief: $reviewedByChief
    ) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      acceptedByTechnicalStaff
      acceptedByReceivingClerk
      recordedByReceivingClerk
      reviewedByChief
      dateOfSubmission
      history {
        notes
        timestamp
      }
    }
  }
`;

export const useApplications = ({ status, currentStage, acceptedByTechnicalStaff, recordedByReceivingClerk }) => {
   const { data, loading, error, refetch } = useQuery(GET_APPLICATIONS, {
      variables: {
         status,
         currentStage,
         acceptedByTechnicalStaff,
         recordedByReceivingClerk
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
