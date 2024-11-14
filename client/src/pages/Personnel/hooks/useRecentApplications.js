import { gql, useQuery } from '@apollo/client';
import { getUserRoles } from '../../../utils/auth';

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
      ... on PLTCPPermit {
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

export const useRecentApplications = (limit = 7) => {
   const roles = getUserRoles();

   const getQueryParamsForRole = () => {
      if (roles.includes('Technical_Staff')) {
         return {
            //   status: 'Submitted',
            currentStage: 'TechnicalStaffReview',
            currentStage: 'ReturnedByTechnicalStaff',
            currentStage: 'ForInspectionByTechnicalStaff'
         };
      }
      if (roles.includes('Receiving_Clerk')) {
         return {
            currentStage: 'ReceivingClerkReview',
            currentStage: 'ReturnedByReceivingClerk',
            currentStage: 'ForRecordByReceivingClerk',
         };
      }
      if (roles.includes('Chief_RPS') || roles.includes('Chief_TSD')) {
         return {
            currentStage: 'ChiefRPSReview'
         };
      }
      if (roles.includes('PENR_CENR_Officer')) {
         return {
            currentStage: 'CENRPENRReview',
            currentStage: 'ReturnedByPENRCENROfficer',
         };
      }
      if (roles.includes('Accountant')) {
         return {
            currentStage: 'AccountantReview'
         };
      }
      // Default case for other roles or no role
      return {
         status: 'Submitted'
      };
   };

   const { data, loading, error, refetch } = useQuery(GET_APPLICATIONS, {
      variables: getQueryParamsForRole(),
      fetchPolicy: 'network-only'
   });

   console.log('Role:', roles);
   console.log('Query params:', getQueryParamsForRole());
   console.log('Query response:', { data, loading, error });

   return {
      recentApplications: data?.getApplicationsByStatus || [],
      loading,
      error,
      refetch
   };
};
