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

// Add query to get all OOPs
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
    }
  }
`;

// Add query for user's OOPs
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

// Add payment proof related queries
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

// Add the mutation
const FORWARD_OOP_TO_ACCOUNTANT = gql`
  mutation ForwardOOPToAccountant($id: ID!) {
    forwardOOPToAccountant(id: $id) {
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

export const useOrderOfPayments = (userId = null) => {
   // Query for applications awaiting OOP
   const {
      data: applicationsData,
      loading: applicationsLoading,
      error: applicationsError,
      refetch: refetchApplications
   } = useQuery(GET_APPLICATIONS_AWAITING_OOP, {
      variables: { awaitingOOP: true },
      fetchPolicy: 'network-only'
   });

   // Add query for all OOPs
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
      skip: !userId, // Skip this query if no userId is provided
      fetchPolicy: 'network-only'
   });

   // Log whenever applications change
   useEffect(() => {
      console.log('Current applications:', applicationsData?.getApplicationsByStatus);
   }, [applicationsData]);

   // Mutations
   const [createOOP] = useMutation(CREATE_OOP);
   const [updateSignature] = useMutation(UPDATE_OOP_SIGNATURE);
   const [forwardToAccountant] = useMutation(FORWARD_OOP_TO_ACCOUNTANT);

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

         // Add optional fields
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
               variables: { awaitingOOP: true }
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

   const handleForwardToAccountant = async (oopId) => {
      try {
         const { data } = await forwardToAccountant({
            variables: { id: oopId },
            refetchQueries: [{ query: GET_ALL_OOPS }]
         });
         return data.forwardOOPToAccountant;
      } catch (error) {
         console.error('Error forwarding OOP:', error);
         throw new Error(error.message);
      }
   };

   const refetchAll = async () => {
      await Promise.all([refetchApplications(), refetchOOPs()]);
   };

   return {
      // Applications data
      applications: applicationsData?.getApplicationsByStatus || [],
      applicationsLoading,
      applicationsError,

      // OOPs data
      oops: oopsData?.getOOPs || [],
      oopsLoading,
      oopsError,

      // User's OOPs data - return empty array if no data
      userOops: userOopsData?.getUserOOPs || [],
      userOopsLoading,
      userOopsError,

      // Mutations and refetch
      createOOP: handleCreateOOP,
      updateSignature: handleUpdateSignature,
      forwardOOPToAccountant: handleForwardToAccountant,
      refetch: refetchAll,

      // Add these new fields
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
      }
   };
};
