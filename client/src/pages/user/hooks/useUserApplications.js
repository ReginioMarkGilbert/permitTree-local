import { useQuery, useMutation, gql, useLazyQuery, useApolloClient } from '@apollo/client';
import { useState } from 'react';

const GET_USER_APPLICATIONS = gql`
  query GetUserApplications($status: String, $currentStage: String) {
    getUserApplications(status: $status, currentStage: $currentStage) {
      id
      applicationNumber
      applicationType
      status
      currentStage
      dateOfSubmission
      history {
        stage
        status
        timestamp
        notes
      }
      ... on COVPermit {
        name
        address
        cellphone
        purpose
        driverName
        driverLicenseNumber
        vehiclePlateNumber
        originAddress
        destinationAddress
        files {
          letterOfIntent { filename contentType }
          tallySheet { filename contentType }
          forestCertification { filename contentType }
          orCr { filename contentType }
          driverLicense { filename contentType }
          specialPowerOfAttorney { filename contentType }
        }
      }
      ... on CSAWPermit {
        registrationType
        chainsawStore
        ownerName
        address
        phone
        brand
        model
        serialNumber
        dateOfAcquisition
        powerOutput
        maxLengthGuidebar
        countryOfOrigin
        purchasePrice
        isOwner
        isTenureHolder
        isBusinessOwner
        isPTPRHolder
        isWPPHolder
        files {
          officialReceipt { filename contentType }
          deedOfSale { filename contentType }
          specialPowerOfAttorney { filename contentType }
          forestTenureAgreement { filename contentType }
          businessPermit { filename contentType }
          certificateOfRegistration { filename contentType }
          woodProcessingPlantPermit { filename contentType }
        }
      }
      ... on COVPermit {
        name
        address
        cellphone
        purpose
        driverName
        driverLicenseNumber
        vehiclePlateNumber
        originAddress
        destinationAddress
        files {
          letterOfIntent { filename contentType }
          tallySheet { filename contentType }
          forestCertification { filename contentType }
          orCr { filename contentType }
          driverLicense { filename contentType }
          specialPowerOfAttorney { filename contentType }
        }
      }
      ... on PTPRPermit {
        ownerName
        address
        contactNumber
        lotArea
        treeSpecies
        totalTrees
        treeSpacing
        yearPlanted
        files {
          letterRequest { filename contentType }
          titleOrTaxDeclaration { filename contentType }
          darCertification { filename contentType }
          specialPowerOfAttorney { filename contentType }
        }
      }
      ... on PLTCPPermit {
        name
        address
        contactNumber
        treeType
        treeStatus
        landType
        posingDanger
        forPersonalUse
        purpose
        files {
          applicationLetter { filename contentType }
          lguEndorsement { filename contentType }
          homeownersResolution { filename contentType }
          ptaResolution { filename contentType }
        }
      }
      ... on PLTPPermit {
        name
        address
        contactNumber
        plantedTrees
        naturallyGrown
        standing
        blownDown
        withinPrivateLand
        withinTenuredForestLand
        posingDanger
        forPersonalUse
        purpose
        files {
          letterOfIntent { filename contentType }
          lguEndorsement { filename contentType }
          titleCertificate { filename contentType }
          darCertificate { filename contentType }
          specialPowerOfAttorney { filename contentType }
          ptaResolution { filename contentType }
        }
      }
    }
  }
`;

const GET_CSAW_PERMIT = gql`
  query GetCSAWPermit($id: ID!) {
    getCSAWPermitById(id: $id) {
      id
      registrationType
      chainsawStore
      ownerName
      address
      phone
      brand
      model
      serialNumber
      dateOfAcquisition
      powerOutput
      maxLengthGuidebar
      countryOfOrigin
      purchasePrice
      isOwner
      isTenureHolder
      isBusinessOwner
      isPTPRHolder
      isWPPHolder
      files {
        officialReceipt { filename contentType }
        deedOfSale { filename contentType }
        specialPowerOfAttorney { filename contentType }
        forestTenureAgreement { filename contentType }
        businessPermit { filename contentType }
        certificateOfRegistration { filename contentType }
        woodProcessingPlantPermit { filename contentType }
      }
    }
  }
`;

const UPDATE_CSAW_PERMIT = gql`
  mutation UpdateCSAWPermit($id: ID!, $input: CSAWPermitInput!) {
    updateCSAWPermit(id: $id, input: $input) {
      id
      registrationType
      chainsawStore
      ownerName
      address
      phone
      brand
      model
      serialNumber
      dateOfAcquisition
      powerOutput
      maxLengthGuidebar
      countryOfOrigin
      purchasePrice
      isOwner
      isTenureHolder
      isBusinessOwner
      isPTPRHolder
      isWPPHolder
    }
  }
`;

const GET_COV_PERMIT = gql`
  query GetCOVPermit($id: ID!) {
    getCOVPermitById(id: $id) {
      id
      name
      address
      cellphone
      purpose
      driverName
      driverLicenseNumber
      vehiclePlateNumber
      originAddress
      destinationAddress
      files {
        letterOfIntent { filename contentType }
        tallySheet { filename contentType }
        forestCertification { filename contentType }
        orCr { filename contentType }
        driverLicense { filename contentType }
        specialPowerOfAttorney { filename contentType }
      }
    }
  }
`;

const UPDATE_COV_PERMIT = gql`
  mutation UpdateCOVPermit($id: ID!, $input: COVPermitInput!) {
    updateCOVPermit(id: $id, input: $input) {
      id
      name
      address
      cellphone
      purpose
      driverName
      driverLicenseNumber
      vehiclePlateNumber
      originAddress
      destinationAddress
      files {
        letterOfIntent { filename contentType }
        tallySheet { filename contentType }
        forestCertification { filename contentType }
        orCr { filename contentType }
        driverLicense { filename contentType }
        specialPowerOfAttorney { filename contentType }
      }
    }
  }
`;

const GET_PTPR_PERMIT = gql`
  query GetPTPRPermit($id: ID!) {
    getPTPRPermitById(id: $id) {
      id
      ownerName
      address
      contactNumber
      lotArea
      treeSpecies
      totalTrees
      treeSpacing
      yearPlanted
      files {
        letterRequest { filename contentType }
        titleOrTaxDeclaration { filename contentType }
        darCertification { filename contentType }
        specialPowerOfAttorney { filename contentType }
      }
    }
  }
`;

const UPDATE_PTPR_PERMIT = gql`
  mutation UpdatePTPRPermit($id: ID!, $input: PTPRPermitInput!) {
    updatePTPRPermit(id: $id, input: $input) {
      id
      ownerName
      address
      contactNumber
      lotArea
      treeSpecies
      totalTrees
      treeSpacing
      yearPlanted
      files {
        letterRequest { filename contentType }
        titleOrTaxDeclaration { filename contentType }
        darCertification { filename contentType }
        specialPowerOfAttorney { filename contentType }
      }
    }
  }
`;

const GET_PLTCP_PERMIT = gql`
  query GetPLTCPPermit($id: ID!) {
    getPLTCPPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      name
      address
      contactNumber
      treeType
      treeStatus
      landType
      posingDanger
      forPersonalUse
      purpose
      status
      dateOfSubmission
      files {
        applicationLetter { filename contentType }
        lguEndorsement { filename contentType }
        homeownersResolution { filename contentType }
        ptaResolution { filename contentType }
      }
    }
  }
`;

const UPDATE_PLTCP_PERMIT = gql`
  mutation UpdatePLTCPPermit($id: ID!, $input: PLTCPPermitInput!) {
    updatePLTCPPermit(id: $id, input: $input) {
      id
      name
      address
      contactNumber
      treeType
      treeStatus
      landType
      posingDanger
      forPersonalUse
      purpose
      files {
        applicationLetter { filename contentType }
        lguEndorsement { filename contentType }
        homeownersResolution { filename contentType }
        ptaResolution { filename contentType }
      }
    }
  }
`;

const GET_PLTP_PERMIT = gql`
  query GetPLTPPermit($id: ID!) {
    getPLTPPermitById(id: $id) {
      id
      name
      address
      contactNumber
      plantedTrees
      naturallyGrown
      standing
      blownDown
      withinPrivateLand
      withinTenuredForestLand
      posingDanger
      forPersonalUse
      purpose
      files {
        letterOfIntent { filename contentType }
        lguEndorsement { filename contentType }
        titleCertificate { filename contentType }
        darCertificate { filename contentType }
        specialPowerOfAttorney { filename contentType }
        ptaResolution { filename contentType }
      }
    }
  }
`;

const UPDATE_PLTP_PERMIT = gql`
  mutation UpdatePLTPPermit($id: ID!, $input: PLTPPermitInput!) {
    updatePLTPPermit(id: $id, input: $input) {
      id
      name
      address
      contactNumber
      plantedTrees
      naturallyGrown
      standing
      blownDown
      withinPrivateLand
      withinTenuredForestLand
      posingDanger
      forPersonalUse
      purpose
      files {
        letterOfIntent { filename contentType }
        lguEndorsement { filename contentType }
        titleCertificate { filename contentType }
        darCertificate { filename contentType }
        specialPowerOfAttorney { filename contentType }
        ptaResolution { filename contentType }
      }
    }
  }
`;

const UNSUBMIT_PERMIT = gql`
  mutation UnsubmitPermit($id: ID!) {
    unsubmitPermit(id: $id) {
      id
      status
      currentStage
    }
  }
`;

const SUBMIT_PERMIT = gql`
  mutation SubmitPermit($id: ID!) {
    submitPermit(id: $id) {
      id
      status
      currentStage
    }
  }
`;

const DELETE_PERMIT = gql`
  mutation DeletePermit($id: ID!) {
    deletePermit(id: $id)
  }
`;

const GET_TCEBP_PERMIT = gql`
  query GetTCEBPPermit($id: ID!) {
    getTCEBPPermitById(id: $id) {
      id
      applicationNumber
      applicationType
      requestType
      name
      address
      contactNumber
      purpose
      status
      dateOfSubmission
      files {
        letterOfIntent { filename contentType }
        lguEndorsement { filename contentType }
        landTenurial { filename contentType }
        siteDevelopmentPlan { filename contentType }
        environmentalCompliance { filename contentType }
        fpic { filename contentType }
        ownerConsent { filename contentType }
        pambClearance { filename contentType }
      }
    }
  }
`;

const UPDATE_TCEBP_PERMIT = gql`
  mutation UpdateTCEBPPermit($id: ID!, $input: TCEBPPermitInput!) {
    updateTCEBPPermit(id: $id, input: $input) {
      id
      applicationNumber
      applicationType
      requestType
      name
      address
      contactNumber
      purpose
      status
      dateOfSubmission
      files {
        letterOfIntent { filename contentType }
        lguEndorsement { filename contentType }
        landTenurial { filename contentType }
        siteDevelopmentPlan { filename contentType }
        environmentalCompliance { filename contentType }
        fpic { filename contentType }
        ownerConsent { filename contentType }
        pambClearance { filename contentType }
      }
    }
  }
`;

const RESUBMIT_PERMIT = gql`
  mutation ResubmitPermit($id: ID!) {
    submitPermit(id: $id) {
      id
      status
    }
  }
`;

export const useUserApplications = (status, currentStage) => {
   const client = useApolloClient();
   const [isLoading, setIsLoading] = useState(false);
   const { data, error, refetch } = useQuery(GET_USER_APPLICATIONS, {
      variables: { status, currentStage },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      onError: (error) => {
         console.error('Query error:', error);
         setIsLoading(false);
      },
      onCompleted: (data) => {
         console.log('Query completed:', data);
         setIsLoading(false);
      },
   });

   console.log('useUserApplications params:', { status, currentStage });
   console.log('useUserApplications state:', { loading: isLoading, error, data });

   const [deletePermitMutation] = useMutation(DELETE_PERMIT);
   const [updateCOVPermitMutation] = useMutation(UPDATE_COV_PERMIT);
   const [getCOVPermit] = useLazyQuery(GET_COV_PERMIT);
   const [updateCSAWPermitMutation] = useMutation(UPDATE_CSAW_PERMIT);
   const [getCSAWPermit] = useLazyQuery(GET_CSAW_PERMIT);
   const [updatePLTCPPermitMutation] = useMutation(UPDATE_PLTCP_PERMIT);
   const [getPLTCPPermit] = useLazyQuery(GET_PLTCP_PERMIT);
   const [unsubmitPermitMutation] = useMutation(UNSUBMIT_PERMIT);
   const [submitPermitMutation] = useMutation(SUBMIT_PERMIT);
   const [updatePTPRPermitMutation] = useMutation(UPDATE_PTPR_PERMIT);
   const [getPTPRPermit] = useLazyQuery(GET_PTPR_PERMIT);
   const [updatePLTPPermitMutation] = useMutation(UPDATE_PLTP_PERMIT);
   const [getPLTPPermit] = useLazyQuery(GET_PLTP_PERMIT);
   const [updateTCEBPPermitMutation] = useMutation(UPDATE_TCEBP_PERMIT);
   const [getTCEBPPermit] = useLazyQuery(GET_TCEBP_PERMIT);
   const [resubmitPermitMutation] = useMutation(RESUBMIT_PERMIT);

   const deletePermit = async (id) => {
      console.log('Attempting to delete permit with id:', id);
      try {
         const { data } = await deletePermitMutation({
            variables: { id },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status } }]
         });
         console.log('Delete mutation result:', data);
         if (data.deletePermit) {
            return true;
         } else {
            throw new Error('Failed to delete permit');
         }
      } catch (error) {
         console.error('Error deleting permit:', error);
         throw error;
      }
   };

   const updateCOVPermit = async (id, input) => {
      console.log('Updating COV permit:', id);
      console.log('Update input:', input);
      try {
         // Process files, including removals
         const updatedFiles = {};
         if (input.files) {
            Object.entries(input.files).forEach(([key, value]) => {
               if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                  updatedFiles[key] = []; // Send an empty array to indicate file removal
               } else if (Array.isArray(value) && value.length > 0) {
                  updatedFiles[key] = value.map(file => ({
                     filename: file.filename,
                     contentType: file.contentType,
                     data: file.data || '' // Only include data if it's present
                  }));
               }
            });
         }

         const { data } = await updateCOVPermitMutation({
            variables: {
               id,
               input: {
                  name: input.name,
                  address: input.address,
                  cellphone: input.cellphone,
                  purpose: input.purpose,
                  driverName: input.driverName,
                  driverLicenseNumber: input.driverLicenseNumber,
                  vehiclePlateNumber: input.vehiclePlateNumber,
                  originAddress: input.originAddress,
                  destinationAddress: input.destinationAddress,
                  files: updatedFiles
               }
            },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status: input.status } }]
         });
         console.log('Update mutation result:', data);
         if (data.updateCOVPermit) {
            return data.updateCOVPermit;
         } else {
            throw new Error('Failed to update permit');
         }
      } catch (error) {
         console.error('Error updating permit:', error);
         throw error;
      }
   };

   const fetchCOVPermit = async (id) => {
      try {
         const { data } = await getCOVPermit({ variables: { id } });
         return data.getCOVPermitById;
      } catch (error) {
         console.error('Error fetching COV permit:', error);
         throw error;
      }
   };

   const updateCSAWPermit = async (id, input) => {
      console.log('Updating CSAW permit:', id);
      console.log('Update input:', input);
      try {
         // Create a new object with only the fields allowed in CSAWPermitInput
         const cleanedInput = {
            registrationType: input.registrationType,
            chainsawStore: input.chainsawStore,
            ownerName: input.ownerName,
            address: input.address,
            phone: input.phone,
            brand: input.brand,
            model: input.model,
            serialNumber: input.serialNumber,
            dateOfAcquisition: input.dateOfAcquisition.split('T')[0],
            powerOutput: input.powerOutput,
            maxLengthGuidebar: input.maxLengthGuidebar,
            countryOfOrigin: input.countryOfOrigin,
            purchasePrice: parseFloat(input.purchasePrice),
            isOwner: Boolean(input.isOwner),
            isTenureHolder: Boolean(input.isTenureHolder),
            isBusinessOwner: Boolean(input.isBusinessOwner),
            isPTPRHolder: Boolean(input.isPTPRHolder),
            isWPPHolder: Boolean(input.isWPPHolder),
         };

         // Handle files separately
         if (input.files) {
            cleanedInput.files = {};
            Object.keys(input.files).forEach(key => {
               if (Array.isArray(input.files[key])) {
                  cleanedInput.files[key] = input.files[key].map(file => ({
                     filename: file.filename,
                     contentType: file.contentType,
                     data: file.data
                  }));
               }
            });
         }

         console.log('Cleaned input:', cleanedInput);

         const { data } = await updateCSAWPermitMutation({
            variables: {
               id,
               input: cleanedInput
            },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status: input.status } }]
         });
         console.log('Update mutation result:', data);
         if (data.updateCSAWPermit) {
            return data.updateCSAWPermit;
         } else {
            throw new Error('Failed to update permit');
         }
      } catch (error) {
         console.error('Error updating permit:', error);
         throw error;
      }
   };

   const fetchCSAWPermit = async (id) => {
      try {
         const { data } = await getCSAWPermit({ variables: { id } });
         // console.log('Fetched CSAW permit data:', data.getCSAWPermitById); // Add this line
         return data.getCSAWPermitById;
      } catch (error) {
         console.error('Error fetching CSAW permit:', error);
         throw error;
      }
   };

   const fetchPLTCPPermit = async (id) => {
      try {
         const { data } = await getPLTCPPermit({ variables: { id } });
         return data.getPLTCPPermitById;
      } catch (error) {
         console.error('Error fetching PLTCP permit:', error);
         // console.error('id:', id)
         throw error;
      }
   };

   const updatePLTCPPermit = async (id, input) => {
      console.log('Updating PLTCP permit:', id);
      console.log('Update input:', input);

      try {
         const updatedFiles = {};
         if (input.files) {
            Object.entries(input.files).forEach(([key, value]) => {
               if (Array.isArray(value) && value.length > 0) {
                  updatedFiles[key] = value.map(file => ({
                     filename: file.filename,
                     contentType: file.contentType,
                     data: file.data
                  }));
               }
            });
         }

         const { data } = await updatePLTCPPermitMutation({
            variables: {
               id,
               input: {
                  name: input.name,
                  address: input.address,
                  contactNumber: input.contactNumber,
                  treeType: input.treeType,
                  treeStatus: input.treeStatus,
                  landType: input.landType,
                  posingDanger: input.posingDanger,
                  forPersonalUse: input.forPersonalUse,
                  purpose: input.purpose,
                  files: updatedFiles
               }
            },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status: input.status } }]
         });
         console.log('Update mutation result:', data);
         if (data.updatePLTCPPermit) {
            return data.updatePLTCPPermit;
         } else {
            throw new Error('Failed to update permit');
         }
      } catch (error) {
         console.error('Error updating PLTCP permit:', error);
         console.error('Error details:', error.graphQLErrors);
         throw error;
      }
   };

   const unsubmitPermit = async (id) => {
      console.log('Attempting to unsubmit permit with id:', id);
      try {
         const { data } = await unsubmitPermitMutation({
            variables: { id },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status } }]
         });
         console.log('Unsubmit mutation result:', data);
         if (data.unsubmitPermit) {
            return data.unsubmitPermit;
         } else {
            throw new Error('Failed to unsubmit permit');
         }
      } catch (error) {
         console.error('Error unsubmitting permit:', error);
         if (error.graphQLErrors) {
            error.graphQLErrors.forEach(({ message, locations, path }) => {
               console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
            });
         }
         if (error.networkError) {
            console.log(`[Network error]: ${error.networkError}`);
         }
         throw error;
      }
   };

   const submitPermit = async (id) => {
      console.log('Attempting to submit permit with id:', id);
      try {
         const { data } = await submitPermitMutation({
            variables: { id },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status } }]
         });
         console.log('Submit mutation result:', data);
         if (data.submitPermit) {
            return data.submitPermit;
         } else {
            throw new Error('Failed to submit permit');
         }
      } catch (error) {
         console.error('Error submitting permit:', error);
         if (error.graphQLErrors) {
            error.graphQLErrors.forEach(({ message, locations, path }) => {
               console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
            });
         }
         if (error.networkError) {
            console.log(`[Network error]: ${error.networkError}`);
         }
         throw error;
      }
   };

   const updatePTPRPermit = async (id, input) => {
      console.log('Updating PTPR permit:', id);
      console.log('Update input:', input);

      try {
         const updatedFiles = {};
         if (input.files) {
            Object.entries(input.files).forEach(([key, value]) => {
               if (Array.isArray(value) && value.length > 0) {
                  updatedFiles[key] = value.map(file => ({
                     filename: file.filename,
                     contentType: file.contentType,
                     data: file.data
                  }));
               }
            });
         }

         const { data } = await updatePTPRPermitMutation({
            variables: {
               id,
               input: {
                  ownerName: input.ownerName,
                  address: input.address,
                  contactNumber: input.contactNumber,
                  lotArea: parseFloat(input.lotArea),
                  treeSpecies: input.treeSpecies,
                  totalTrees: parseInt(input.totalTrees),
                  treeSpacing: input.treeSpacing,
                  yearPlanted: parseInt(input.yearPlanted),
                  files: updatedFiles
               }
            },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status: input.status } }]
         });
         console.log('Update mutation result:', data);
         if (data.updatePTPRPermit) {
            return data.updatePTPRPermit;
         } else {
            throw new Error('Failed to update permit');
         }
      } catch (error) {
         console.error('Error updating PTPR permit:', error);
         console.error('Error details:', error.graphQLErrors);
         throw error;
      }
   };

   const fetchPTPRPermit = async (id) => {
      try {
         const { data } = await getPTPRPermit({ variables: { id } });
         return data.getPTPRPermitById;
      } catch (error) {
         console.error('Error fetching PTPR permit:', error);
         throw error;
      }
   };

   const updatePLTPPermit = async (id, input) => {
      console.log('Updating PLTP permit:', id);
      console.log('Update input:', input);
      try {
         // Clean the input data
         const cleanedInput = {
            name: input.name,
            address: input.address,
            contactNumber: input.contactNumber,
            plantedTrees: input.plantedTrees,
            naturallyGrown: input.naturallyGrown,
            standing: input.standing,
            blownDown: input.blownDown,
            withinPrivateLand: input.withinPrivateLand,
            withinTenuredForestLand: input.withinTenuredForestLand,
            posingDanger: input.posingDanger,
            forPersonalUse: input.forPersonalUse,
            purpose: input.purpose,
            files: {}
         };

         // Clean the files data
         if (input.files) {
            Object.keys(input.files).forEach(fileType => {
               if (Array.isArray(input.files[fileType])) {
                  cleanedInput.files[fileType] = input.files[fileType].map(file => ({
                     filename: file.filename,
                     contentType: file.contentType,
                     data: file.data
                  }));
               }
            });
         }

         const { data } = await updatePLTPPermitMutation({
            variables: {
               id,
               input: cleanedInput
            },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status: input.status } }]
         });
         console.log('Update mutation result:', data);
         if (data.updatePLTPPermit) {
            return data.updatePLTPPermit;
         } else {
            throw new Error('Failed to update permit');
         }
      } catch (error) {
         console.error('Error updating PLTP permit:', error);
         throw error;
      }
   };

   const fetchPLTPPermit = async (id) => {
      try {
         const { data } = await getPLTPPermit({ variables: { id } });
         return data.getPLTPPermitById;
      } catch (error) {
         console.error('Error fetching PLTP permit:', error);
         throw error;
      }
   };

   const updateTCEBPPermit = async (id, input) => {
      console.log('Updating TCEBP permit:', id);
      console.log('Update input:', input);
      try {
         // Clean up the input data
         const cleanedInput = {
            name: input.name,
            address: input.address,
            contactNumber: input.contactNumber,
            purpose: input.purpose,
            requestType: input.requestType,
            files: {}
         };

         // Process files
         if (input.files) {
            Object.keys(input.files).forEach(key => {
               if (key !== '__typename') {  // Skip the __typename field
                  if (Array.isArray(input.files[key]) && input.files[key].length > 0) {
                     cleanedInput.files[key] = input.files[key].map(file => ({
                        filename: file.filename,
                        contentType: file.contentType,
                        // Only include data if it's present (it might not be for existing files)
                        ...(file.data && { data: file.data })
                     }));
                  } else {
                     cleanedInput.files[key] = [];
                  }
               }
            });
         }

         console.log('Cleaned input:', cleanedInput);

         const { data } = await updateTCEBPPermitMutation({
            variables: {
               id,
               input: cleanedInput
            },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status: input.status } }]
         });
         console.log('Update mutation result:', data);
         if (data.updateTCEBPPermit) {
            return data.updateTCEBPPermit;
         } else {
            throw new Error('Failed to update permit');
         }
      } catch (error) {
         console.error('Error updating permit:', error);
         throw error;
      }
   };

   const fetchTCEBPPermit = async (id) => {
      try {
         const { data } = await getTCEBPPermit({ variables: { id } });
         return data.getTCEBPPermitById;
      } catch (error) {
         console.error('Error fetching TCEBP permit:', error);
         throw error;
      }
   };

   const resubmitPermit = async (id) => {
      console.log('Attempting to resubmit permit with id:', id);
      try {
         const { data } = await resubmitPermitMutation({
            variables: { id },
            refetchQueries: [{ query: GET_USER_APPLICATIONS, variables: { status, currentStage } }]
         });
         console.log('Resubmit mutation result:', data);
         if (data.submitPermit) {
            return data.submitPermit;
         } else {
            throw new Error('Failed to resubmit permit');
         }
      } catch (error) {
         console.error('Error resubmitting permit:', error);
         throw error;
      }
   };

   const fetchUserApplications = async (status, currentStage) => {
      try {
         setIsLoading(true);
         console.log('Fetching applications with:', { status, currentStage });
         const { data } = await refetch({ status, currentStage });
         console.log('Fetch result:', data);
         setIsLoading(false);
         return data?.getUserApplications || [];
      } catch (error) {
         console.error('User side, Error fetching user applications:', error);
         setIsLoading(false);
         throw error;
      }
   };

   // Update loading state calculation
   const loading = isLoading || (!data && !error);

   return {
      applications: data?.getUserApplications || [],
      loading,
      error,
      refetch,
      fetchUserApplications,

      deletePermit,
      unsubmitPermit,
      submitPermit,

      updateCSAWPermit,
      fetchCSAWPermit,

      updateCOVPermit,
      fetchCOVPermit,

      updatePTPRPermit,
      fetchPTPRPermit,

      updatePLTCPPermit,
      fetchPLTCPPermit,

      updatePLTPPermit,
      fetchPLTPPermit,

      updateTCEBPPermit,
      fetchTCEBPPermit,

      resubmitPermit,
   };
};
