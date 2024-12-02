import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { useEffect } from 'react';
import { getUserRoles } from '@/utils/auth';
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
      OOPCreated
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
      applicationNumber
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
      receivedDate
      receivedTime
      trackingNo
      releasedDate
      releasedTime
    }
  }
`;

export const GET_ALL_OOPS = gql`
  query GetOOPs {
    getOOPs {
      _id
      billNo
      applicationId
      applicationNumber
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
      OOPstatus
      OOPSignedByTwoSignatories
      createdAt
      updatedAt
      rpsSignatureImage
      tsdSignatureImage
      receivedDate
      receivedTime
      trackingNo
      releasedDate
      releasedTime
      paymentProof {
        transactionId
        paymentMethod
        amount
        timestamp
        referenceNumber
        payerDetails {
          name
          email
          phoneNumber
        }
        status
      }
      officialReceipt {
        orNumber
        dateIssued
        amount
        paymentMethod
        remarks
      }
    }
  }
`;

export const GET_USER_OOPS = gql`
  query GetUserOOPs($OOPstatus: String) {
    getUserOOPs(OOPstatus: $OOPstatus) {
      _id
      billNo
      applicationId
      applicationNumber
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
      OOPstatus
      createdAt
      receivedDate
      receivedTime
      trackingNo
      releasedDate
      releasedTime
    }
  }
`;

const GET_OOP_WITH_PAYMENT_PROOF = gql`
  query GetOOPWithPaymentProof($id: ID!) {
    getOOPById(id: $id) {
      _id
      billNo
      applicationId
      totalAmount
      OOPstatus
      paymentProof {
        transactionId
        paymentMethod
        amount
        timestamp
        referenceNumber
        payerDetails {
          name
          email
          phoneNumber
        }
        status
      }
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
      applicationNumber
      namePayee
      address
      natureOfApplication
      items {
        legalBasis
        description
        amount
      }
      totalAmount
      OOPstatus
    }
  }
`;

const UPDATE_OOP_SIGNATURE = gql`
  mutation UpdateOOPSignature($id: ID!, $signatureType: String!, $signatureImage: String!) {
    updateOOPSignature(id: $id, signatureType: $signatureType, signatureImage: $signatureImage) {
      _id
      OOPstatus
      signatures {
        chiefRPS
        technicalServices
      }
      rpsSignatureImage
      tsdSignatureImage
    }
  }
`;

const FORWARD_OOP_TO_TECHNICAL_STAFF = gql`
  mutation ForwardOOPToTechnicalStaff($id: ID!) {
    forwardOOPToTechnicalStaff(id: $id) {
      _id
      OOPstatus
      OOPSignedByTwoSignatories
      signatures {
        chiefRPS
        technicalServices
      }
      receivedDate
      receivedTime
      trackingNo
      releasedDate
      releasedTime
    }
  }
`;

export const GET_RECENT_OOPS = gql`
  query GetRecentOOPs($status: String, $limit: Int) {
    getRecentOOPs(status: $status, limit: $limit) {
      _id
      billNo
      applicationNumber
      namePayee
      totalAmount
      OOPstatus
      createdAt
      natureOfApplication
    }
  }
`;

export const useOrderOfPayments = (userId = null) => {
   const client = useApolloClient();
   const userRoles = getUserRoles();
   // const status = userRoles.includes('Accountant')
   const status = userRoles.includes('Technical_Staff')
      ? "For Approval"
      : userRoles.includes('Bill_Collector')
         ? "Awaiting Payment"
         : null;

   // Query for applications awaiting OOP
   const {
      data: applicationsData,
      loading: applicationsLoading,
      error: applicationsError,
      refetch: refetchApplications
   } = useQuery(GET_APPLICATIONS_AWAITING_OOP, {
      variables: { awaitingOOP: true, OOPCreated: false },
      fetchPolicy: 'network-only'
   });

   // Query for all OOPs
   const {
      data: oopsData,
      loading: oopsLoading,
      error: oopsError,
      refetch: refetchOOPs
   } = useQuery(GET_ALL_OOPS, {
      fetchPolicy: 'network-only'
   });

   // Only fetch user OOPs if userId is provided
   const {
      data: userOopsData,
      loading: userOopsLoading,
      error: userOopsError,
      refetch: refetchUserOOPs
   } = useQuery(GET_USER_OOPS, {
      variables: { userId },
      skip: !userId,
      fetchPolicy: 'network-only'
   });

   const {
      data: recentOOPsData,
      loading: recentOOPsLoading,
      error: recentOOPsError,
      refetch: refetchRecentOOPs
   } = useQuery(GET_RECENT_OOPS, {
      variables: { status, limit: 7 },
      fetchPolicy: 'network-only',
      skip: !status // Skip if no relevant status (not Accountant or Bill Collector)
   });

   // Log whenever applications change
   useEffect(() => {
      console.log('Current applications:', applicationsData?.getApplicationsByStatus);
   }, [applicationsData]);

   // Mutations
   const [createOOP] = useMutation(CREATE_OOP);
   const [updateSignature] = useMutation(UPDATE_OOP_SIGNATURE);
   const [forwardToTechnicalStaff] = useMutation(FORWARD_OOP_TO_TECHNICAL_STAFF);

   const handleCreateOOP = async (oopData) => {
      try {
         // Validate input
         if (!oopData.items?.length) {
            throw new Error('At least one fee item is required');
         }

         // Transform the input to match the schema exactly
         const input = {
            applicationId: oopData.applicationId.toString(),
            applicationNumber: oopData.applicationNumber,
            namePayee: oopData.namePayee,
            address: oopData.address,
            natureOfApplication: oopData.natureOfApplication,
            items: oopData.items.map(item => ({
               legalBasis: item.legalBasis,
               description: item.description,
               amount: parseFloat(item.amount)
            }))
         };

         if (oopData.rpsSignatureImage) {
            input.rpsSignatureImage = oopData.rpsSignatureImage;
         }
         if (oopData.tsdSignatureImage) {
            input.tsdSignatureImage = oopData.tsdSignatureImage;
         }

         console.log('Mutation input:', input);

         const { data } = await createOOP({
            variables: { input },
            refetchQueries: [{
               query: GET_APPLICATIONS_AWAITING_OOP,
               variables: { awaitingOOP: true, OOPCreated: false }
            }]
         });

         return data.createOOP;
      } catch (error) {
         console.error('Error in handleCreateOOP:', error);
         throw error;
      }
   };

   const handleUpdateSignature = async (oopId, signatureType, signatureImage) => {
      try {
         const { data } = await updateSignature({
            variables: {
               id: oopId,
               signatureType,
               signatureImage
            },
            refetchQueries: [{ query: GET_ALL_OOPS }]
         });
         return data.updateOOPSignature;
      } catch (error) {
         console.error('Error in handleUpdateSignature:', error);
         throw new Error(error.message);
      }
   };

   const handleForwardToTechnicalStaff = async (oopId) => {
      try {
         const { data } = await forwardToTechnicalStaff({
            variables: { id: oopId },
            refetchQueries: [{ query: GET_ALL_OOPS }]
         });
         return data.forwardOOPToTechnicalStaff;
      } catch (error) {
         console.error('Error forwarding OOP:', error);
         throw new Error(error.message);
      }
   };

   const refetchAll = async () => {
      await Promise.all([refetchApplications(), refetchOOPs()]);
   };

   return {
      applications: applicationsData?.getApplicationsByStatus || [],
      applicationsLoading,
      applicationsError,

      oops: oopsData?.getOOPs || [],
      oopsLoading,
      oopsError,

      userOops: userOopsData?.getUserOOPs || [],
      userOopsLoading,
      userOopsError,

      createOOP: handleCreateOOP,
      updateSignature: handleUpdateSignature,
      forwardOOPToTechnicalStaff: handleForwardToTechnicalStaff,
      refetch: refetchAll,

      getOOPWithPaymentProof: async (id) => {
         try {
            const { data } = await client.query({
               query: GET_OOP_WITH_PAYMENT_PROOF,
               variables: { id },
               fetchPolicy: 'network-only'
            });
            return data.getOOPById;
         } catch (error) {
            console.error('Error fetching OOP with payment proof:', error);
            throw error;
         }
      },

      recentOOPs: recentOOPsData?.getRecentOOPs || [],
      recentOOPsLoading,
      recentOOPsError,
      refetchRecentOOPs,
   };
};
