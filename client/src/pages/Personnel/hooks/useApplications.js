import { useQuery, gql } from '@apollo/client';

const GET_APPLICATIONS = gql`
  query GetApplications($status: String, $currentStage: String) {
    getApplicationsByStatus(status: $status, currentStage: $currentStage) {
      id
      applicationNumber
      applicationType
      status
      currentStage
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

export const useApplications = ({ status, currentStage }) => {
   const { data, loading, error, refetch } = useQuery(GET_APPLICATIONS, {
      variables: { status, currentStage },
      fetchPolicy: 'network-only',
   });

   const fetchApplications = async () => {
      try {
         const result = await refetch();
         return result.data?.getApplicationsByStatus || [];
      } catch (refetchError) {
         console.error('Client: Error refetching applications:', refetchError);
         // Return an empty array instead of throwing an error
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
