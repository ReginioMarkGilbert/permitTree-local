import { useQuery, gql } from '@apollo/client';

const GET_APPLICATIONS = gql`
  query GetApplications($status: String, $currentStage: String, $acceptedByTechnicalStaff: Boolean) {
    getApplicationsByStatus(
      status: $status,
      currentStage: $currentStage,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff
    ) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      recordedByReceivingClerk
      reviewedByChief
      acceptedByTechnicalStaff
      dateOfSubmission
      history {
        notes
        timestamp
      }
    }
  }
`;

export const useApplications = ({ status, currentStage, acceptedByTechnicalStaff }) => {
   const { data, loading, error, refetch } = useQuery(GET_APPLICATIONS, {
      variables: { status, currentStage, acceptedByTechnicalStaff },
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
