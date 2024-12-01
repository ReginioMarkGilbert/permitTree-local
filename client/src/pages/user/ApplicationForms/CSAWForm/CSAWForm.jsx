import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/modal';
import '@/components/ui/styles/CSAWFormScrollbar.css';
import '@/components/ui/styles/customScrollBar.css'
import { CheckboxItem, UploadCard, CustomSelect, CustomDatePicker, formatLabel, formatReviewValue } from './CSAWFormUtils';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { Loader2 } from "lucide-react";
import FormStepIndicator from '../FormStepIndicator';

const CREATE_CSAW_PERMIT = gql`
  mutation CreateCSAWPermit($input: CSAWPermitInput!) {
    createCSAWPermit(input: $input) {
      id
      applicationNumber
      status
      dateOfSubmission
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

const SAVE_CSAW_PERMIT_DRAFT = gql`
  mutation SaveCSAWPermitDraft($input: CSAWPermitInput!) {
    saveCSAWPermitDraft(input: $input) {
      id
      applicationNumber
      status
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

const GET_PREVIOUS_CERTIFICATE = gql`
  query GetPreviousCertificate($certificateNumber: String!) {
    getPreviousCertificate(certificateNumber: $certificateNumber) {
      id
      certificateNumber
      certificateData {
        registrationType
        ownerName
        address
        chainsawDetails {
          brand
          model
          serialNumber
          dateOfAcquisition
          powerOutput
          maxLengthGuidebar
          countryOfOrigin
          purchasePrice
        }
      }
    }
  }
`;

const ChainsawRegistrationForm = () => {
   const navigate = useNavigate();
   const [currentStep, setCurrentStep] = useState(() => {
      const savedStep = localStorage.getItem('csawFormStep');
      return savedStep ? parseInt(savedStep, 10) : 0;
   });
   const [formData, setFormData] = useState(() => {
      const savedFormData = localStorage.getItem('csawFormData');
      return savedFormData ? JSON.parse(savedFormData) : {
         applicationType: 'Chainsaw Registration', // Set default application type
         registrationType: '', // New field for registration type
         chainsawStore: '',
         ownerName: '',
         address: '',
         phone: '',
         brand: '',
         model: '',
         serialNumber: '',
         dateOfAcquisition: '',
         powerOutput: '',
         maxLengthGuidebar: '',
         countryOfOrigin: '',
         purchasePrice: '',
         files: {
            officialReceipt: [],
            deedOfSale: [],
            specialPowerOfAttorney: [],
            forestTenureAgreement: [],
            businessPermit: [],
            certificateOfRegistration: [],
            woodProcessingPlantPermit: []
         },
         dateOfSubmission: '',
         status: '',
         isOwner: false,
         isTenureHolder: false,
         isBusinessOwner: false,
         isPTPRHolder: false,
         isWPPHolder: false,
      };
   });
   const [modalOpen, setModalOpen] = useState(false);
   const [modalContent, setModalContent] = useState({ title: '', message: '' });
   const [customStore, setCustomStore] = useState('');
   const [createCSAWPermit] = useMutation(CREATE_CSAW_PERMIT);
   const [saveCSAWPermitDraft] = useMutation(SAVE_CSAW_PERMIT_DRAFT);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSavingDraft, setIsSavingDraft] = useState(false);
   const [previousCertNumber, setPreviousCertNumber] = useState('');
   const [isVerifyingCert, setIsVerifyingCert] = useState(false);
   const [getPreviousCertificate] = useLazyQuery(GET_PREVIOUS_CERTIFICATE);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleSelectChange = (name, value) => {
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleFileChange = (e, documentType) => {
      if (e.target.files) {
         const newFiles = Array.from(e.target.files);
         setFormData(prev => ({
            ...prev,
            files: {
               ...prev.files,
               [documentType]: [...prev.files[documentType], ...newFiles]
            }
         }));
      }
   };

   const removeFile = (documentType, fileToRemove) => {
      setFormData(prev => ({
         ...prev,
         files: {
            ...prev.files,
            [documentType]: prev.files[documentType].filter(file => file !== fileToRemove)
         }
      }));
   };

   const handleNextStep = () => {
      if (currentStep === 0) {
         if (!formData.registrationType) {
            toast.error("Please select a registration type");
            return;
         }
         if (formData.registrationType === 'Renewal' && !formData.previousCertificateNumber) {
            toast.error("Please verify your previous certificate first");
            return;
         }
      }
      if (currentStep === 1) {
         if (!formData.chainsawStore) {
            toast.error("Please enter the name of the chainsaw store.");
            return;
         }
      }
      if (currentStep === 4) {
         const requiredFields = [
            'ownerName',
            'address',
            'phone',
            'brand',
            'model',
            'serialNumber',
            'dateOfAcquisition',
            'powerOutput',
            'maxLengthGuidebar',
            'countryOfOrigin',
            'purchasePrice'
         ];
         for (const field of requiredFields) {
            if (!formData[field]) {
               toast.error("Please fill out all required fields to proceed.");
               return;
            }
         }
      }
      setCurrentStep(prev => prev + 1);
   };

   const handlePrevStep = () => {
      setCurrentStep(prev => prev - 1);
   };

   const handleSaveAsDraft = async () => {
      try {
         const input = {
            registrationType: formData.registrationType,
            chainsawStore: formData.chainsawStore,
            ownerName: formData.ownerName,
            address: formData.address,
            phone: formData.phone,
            brand: formData.brand,
            model: formData.model,
            serialNumber: formData.serialNumber,
            // dateOfAcquisition: formData.dateOfAcquisition ? new Date(formData.dateOfAcquisition).toISOString() : null,
            dateOfAcquisition: new Date(formData.dateOfAcquisition).toISOString(),
            powerOutput: formData.powerOutput ? formData.powerOutput.toString() : '',
            maxLengthGuidebar: formData.maxLengthGuidebar ? formData.maxLengthGuidebar.toString() : '',
            countryOfOrigin: formData.countryOfOrigin,
            purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0,
            isOwner: Boolean(formData.isOwner),
            isTenureHolder: Boolean(formData.isTenureHolder),
            isBusinessOwner: Boolean(formData.isBusinessOwner),
            isPTPRHolder: Boolean(formData.isPTPRHolder),
            isWPPHolder: Boolean(formData.isWPPHolder),
            files: {}
         };

         // Process files
         for (const [key, files] of Object.entries(formData.files)) {
            if (files.length > 0) {
               input.files[key] = await Promise.all(files.map(async (file) => {
                  const content = await readFileAsBase64(file);
                  return {
                     filename: file.name,
                     contentType: file.type,
                     data: content
                  };
               }));
            }
         }

         console.log('Saving draft with input:', input);

         const token = localStorage.getItem('token');
         const { data } = await saveCSAWPermitDraft({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.saveCSAWPermitDraft) {
            setModalContent({
               title: 'Draft saved successfully!',
               message: 'Do you want to view your applications?'
            });
            setModalOpen(true);

            localStorage.removeItem('csawFormStep');
            localStorage.removeItem('csawFormData');
         }
      } catch (error) {
         console.error('Error saving draft:', error);
         toast.error("Error saving draft: " + error.message);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const input = {
            registrationType: formData.registrationType,
            chainsawStore: formData.chainsawStore,
            ownerName: formData.ownerName,
            address: formData.address,
            phone: formData.phone,
            brand: formData.brand,
            model: formData.model,
            serialNumber: formData.serialNumber,
            dateOfAcquisition: new Date(formData.dateOfAcquisition).toISOString(),
            powerOutput: formData.powerOutput.toString(),
            maxLengthGuidebar: formData.maxLengthGuidebar.toString(),
            countryOfOrigin: formData.countryOfOrigin,
            purchasePrice: parseFloat(formData.purchasePrice),
            isOwner: Boolean(formData.isOwner),
            isTenureHolder: Boolean(formData.isTenureHolder),
            isBusinessOwner: Boolean(formData.isBusinessOwner),
            isPTPRHolder: Boolean(formData.isPTPRHolder),
            isWPPHolder: Boolean(formData.isWPPHolder),
            files: {}
         };

         // Process files
         for (const [key, files] of Object.entries(formData.files)) {
            if (files.length > 0) {
               input.files[key] = await Promise.all(files.map(async (file) => {
                  const content = await readFileAsBase64(file);
                  return {
                     filename: file.name,
                     contentType: file.type,
                     data: content
                  };
               }));
            }
         }

         console.log('Submitting input:', input);

         const token = localStorage.getItem('token');
         const { data } = await createCSAWPermit({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.createCSAWPermit) {
            setModalContent({
               title: 'Application submitted successfully!',
               message: 'Do you want to view your application?'
            });
            setModalOpen(true);

            // Clear localStorage
            localStorage.removeItem('csawFormStep');
            localStorage.removeItem('csawFormData');
         }
      } catch (error) {
         console.error('Error submitting application:', error);
         if (error.graphQLErrors) {
            error.graphQLErrors.forEach(({ message, locations, path, extensions }) => {
               console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Extensions:`, extensions);
            });
         }
         if (error.networkError) {
            console.log(`[Network error]:`, error.networkError);
            if (error.networkError.result) {
               console.log('Error result:', error.networkError.result);
            }
         }
         toast.error("Error submitting application: " + error.message);
      }
   };

   // Helper function to read file as base64
   const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result.split(',')[1]);
         reader.onerror = error => reject(error);
         reader.readAsDataURL(file);
      });
   };

   const handleCheckboxChange = (e) => {
      const { name, checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: checked }));
   };

   const handleDateChange = (date) => {
      setFormData(prev => ({ ...prev, dateOfAcquisition: date }));
   };

   const verifyPreviousCertificate = async () => {
      if (!previousCertNumber) {
         toast.error('Please enter previous certificate number');
         return;
      }

      setIsVerifyingCert(true);
      try {
         toast.info('Verifying certificate...', { duration: 1000 });

         const { data } = await getPreviousCertificate({
            variables: { certificateNumber: previousCertNumber }
         });

         if (data?.getPreviousCertificate) {
            const prevCert = data.getPreviousCertificate;
            // Pre-fill form with previous certificate data
            setFormData(prev => ({
               ...prev,
               registrationType: 'Renewal',
               previousCertificateNumber: previousCertNumber,
               brand: prevCert.certificateData.chainsawDetails.brand,
               model: prevCert.certificateData.chainsawDetails.model,
               serialNumber: prevCert.certificateData.chainsawDetails.serialNumber,
               powerOutput: prevCert.certificateData.chainsawDetails.powerOutput,
               maxLengthGuidebar: prevCert.certificateData.chainsawDetails.maxLengthGuidebar,
               countryOfOrigin: prevCert.certificateData.chainsawDetails.countryOfOrigin,
               purchasePrice: prevCert.certificateData.chainsawDetails.purchasePrice,
            }));
            toast.success('Certificate verified successfully! Previous details loaded.', {
               description: `Certificate Number: ${previousCertNumber}`,
               duration: 3000
            });
         }
      } catch (error) {
         // Handle specific error messages
         if (error.message.includes('Certificate not found')) {
            toast.error('Certificate not found', {
               description: 'Please check the certificate number and try again.',
               duration: 3000
            });
         } else if (error.message.includes('does not belong to you')) {
            toast.error('Certificate ownership verification failed', {
               description: 'This certificate is not registered under your name.',
               duration: 3000
            });
         } else if (error.message.includes('Only expired certificates')) {
            toast.error('Certificate not eligible for renewal', {
               description: 'Only expired certificates can be renewed.',
               duration: 3000
            });
         } else {
            toast.error('Verification failed', {
               description: error.message || 'An unexpected error occurred.',
               duration: 3000
            });
         }
      } finally {
         setIsVerifyingCert(false);
      }
   };

   const steps = [
      { title: "Registration Type", description: "Choose registration type" },
      { title: "Accredited Chainsaw Store", description: "Select chainsaw store" },
      { title: "Document Requirements", description: "Specify document requirements" },
      { title: "Upload Documents", description: "Upload necessary documents" },
      { title: "Application Details", description: "Fill in application details" },
      { title: "Review  Your Application", description: "Review your application" },
   ];

   const uploadCardsCount = Object.values(formData).filter(value => value === true).length;
   const isScrollable = uploadCardsCount > 3;

   useEffect(() => {
      localStorage.setItem('csawFormStep', currentStep.toString());
   }, [currentStep]);

   useEffect(() => {
      localStorage.setItem('csawFormData', JSON.stringify(formData));
   }, [formData]);

   useEffect(() => {
      // Cleanup function to remove localStorage items when component unmounts
      return () => {
         localStorage.removeItem('csawFormStep');
         localStorage.removeItem('csawFormData');
      };
   }, []);

   const renderRegistrationTypeStep = () => (
      <div className="space-y-4">
         <div>
            <RadioGroup
               onValueChange={(value) => handleSelectChange('registrationType', value)}
               value={formData.registrationType}
               className="space-y-3"
            >
               <div
                  className={`w-full p-4 rounded-md transition-colors cursor-pointer
                     ${formData.registrationType === 'New'
                        ? 'bg-green-100 hover:bg-green-50 dark:bg-green-900 dark:hover:bg-green-800'
                        : 'bg-gray-100 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
               >
                  <div className="flex items-center space-x-3">
                     <RadioGroupItem value="New" id="new" className="text-green-600 dark:text-green-400" />
                     <Label
                        htmlFor="new"
                        className={`text-base font-medium cursor-pointer
                           ${formData.registrationType === 'New'
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-gray-700 dark:text-gray-300'}`}
                     >
                        New Registration
                     </Label>
                  </div>
               </div>

               <div
                  className={`w-full p-4 rounded-md transition-colors cursor-pointer
                     ${formData.registrationType === 'Renewal'
                        ? 'bg-green-100 hover:bg-green-50 dark:bg-green-900 dark:hover:bg-green-800'
                        : 'bg-gray-100 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
               >
                  <div className="flex items-center space-x-3">
                     <RadioGroupItem value="Renewal" id="renewal" className="text-green-600 dark:text-green-400" />
                     <Label
                        htmlFor="renewal"
                        className={`text-base font-medium cursor-pointer
                           ${formData.registrationType === 'Renewal'
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-gray-700 dark:text-gray-300'}`}
                     >
                        Renewal
                     </Label>
                  </div>
               </div>
            </RadioGroup>
         </div>

         {formData.registrationType === 'Renewal' && (
            <div className="space-y-4 mt-4">
               <div className="flex gap-2">
                  <div className="flex-1">
                     <Label>Previous Certificate Number</Label>
                     <Input
                        value={previousCertNumber}
                        onChange={(e) => setPreviousCertNumber(e.target.value)}
                        placeholder="Enter previous certificate number"
                        className="dark:bg-gray-700 dark:text-white"
                        required
                     />
                  </div>
                  <Button
                     type="button"
                     onClick={verifyPreviousCertificate}
                     disabled={isVerifyingCert || !previousCertNumber}
                     className="mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                     {isVerifyingCert ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Verifying...
                        </>
                     ) : (
                        'Verify'
                     )}
                  </Button>
               </div>
            </div>
         )}
      </div>
   );

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex flex-col justify-between pt-[83px]">
         <div className="container mx-auto">
            <h1 className="text-2xl sm:text-3xl font-[700] text-green-800 dark:text-green-500 mb-4 text-center">
               Chainsaw Registration Application
            </h1>
            <div className="max-w-2xl mx-auto mb-4">
               <FormStepIndicator currentStep={currentStep + 1} steps={steps} />
            </div>
            <Card className="max-w-2xl mx-auto shadow-lg dark:black">
               <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="dark:text-white">{steps[currentStep].title}</CardTitle>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit}>
                     {currentStep === 0 && renderRegistrationTypeStep()}

                     {currentStep === 1 && (
                        <div className="space-y-4 pt-2">
                           <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-semibold">
                              Please enter the name of the store where you purchased your chainsaw.
                           </p>
                           <div className="space-y-2">
                              <Label htmlFor="chainsawStore" className="dark:text-white">Chainsaw Store Name</Label>
                              <Input
                                 id="chainsawStore"
                                 name="chainsawStore"
                                 value={formData.chainsawStore}
                                 onChange={handleInputChange}
                                 placeholder="Enter the name of the store"
                                 required
                                 className="dark:bg-gray-700 dark:text-white"
                              />
                           </div>
                        </div>
                     )}

                     {currentStep === 2 && (
                        <div className="space-y-4">
                           <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 font-semibold">
                              Please check the boxes that apply to you. In the next step, you will be required to upload the corresponding documents.
                           </p>
                           <div className="space-y-2">
                              <CheckboxItem id="isOwner"
                                 label="Are you the owner of the Chainsaw?"
                                 checked={formData.isOwner}
                                 onChange={handleCheckboxChange}
                              />
                              <CheckboxItem id="isTenureHolder"
                                 label="Are you a Tenure holder?"
                                 checked={formData.isTenureHolder}
                                 onChange={handleCheckboxChange}
                              />
                              <CheckboxItem id="isBusinessOwner"
                                 label="Are you a business owner?"
                                 checked={formData.isBusinessOwner}
                                 onChange={handleCheckboxChange}
                              />
                              <CheckboxItem id="isPTPRHolder"
                                 label="Are you a Private Land Tree Plantation Registration (PTPR) holder?"
                                 checked={formData.isPTPRHolder}
                                 onChange={handleCheckboxChange}
                              />
                              <CheckboxItem id="isWPPHolder"
                                 label="Are you a Licensed Wood Processor/Wood Processing Plant (WPP) holder?"
                                 checked={formData.isWPPHolder}
                                 onChange={handleCheckboxChange}
                              />
                           </div>
                        </div>
                     )}

                     {currentStep === 3 && (
                        <div className="step-3-container">
                           <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 font-semibold">
                              Please upload the required documents.
                           </p>
                           <div className="upload-cards-container csaw-form-scrollbar">
                              <UploadCard
                                 label="Official Receipt of Chainsaw Purchase"
                                 documentLabel="Upload 1 certified copy and 1 original for verification (or Affidavit of Ownership if original is lost)"
                                 files={formData.files.officialReceipt}
                                 onFileChange={(e) => handleFileChange(e, 'officialReceipt')}
                                 onRemoveFile={(file) => removeFile('officialReceipt', file)}
                              />
                              <UploadCard
                                 label="Notarized Deed of Absolute Sale"
                                 documentLabel="Upload 1 original (required if transfer of ownership)"
                                 files={formData.files.deedOfSale}
                                 onFileChange={(e) => handleFileChange(e, 'deedOfSale')}
                                 onRemoveFile={(file) => removeFile('deedOfSale', file)}
                              />
                              {!formData.isOwner && (
                                 <UploadCard
                                    label="Special Power of Attorney"
                                    documentLabel="Upload document if you are not the owner of the Chainsaw"
                                    files={formData.files.specialPowerOfAttorney}
                                    onFileChange={(e) => handleFileChange(e, 'specialPowerOfAttorney')}
                                    onRemoveFile={(file) => removeFile('specialPowerOfAttorney', file)}
                                 />
                              )}
                              {formData.isTenureHolder && (
                                 <UploadCard
                                    label="Forest Tenure Agreement"
                                    documentLabel="Upload certified True copy of forest Tenure Agreement"
                                    files={formData.files.forestTenureAgreement}
                                    onFileChange={(e) => handleFileChange(e, 'forestTenureAgreement')}
                                    onRemoveFile={(file) => removeFile('forestTenureAgreement', file)}
                                 />
                              )}
                              {formData.isBusinessOwner && (
                                 <UploadCard
                                    label="Business Permit"
                                    documentLabel="Upload Business Permit"
                                    files={formData.files.businessPermit}
                                    onFileChange={(e) => handleFileChange(e, 'businessPermit')}
                                    onRemoveFile={(file) => removeFile('businessPermit', file)}
                                 />
                              )}
                              {formData.isPTPRHolder && (
                                 <UploadCard
                                    label="Certificate of Registration"
                                    documentLabel="Upload Certificate of Registration for Private Land Tree Plantation Registration (PTPR)"
                                    files={formData.files.certificateOfRegistration}
                                    onFileChange={(e) => handleFileChange(e, 'certificateOfRegistration')}
                                    onRemoveFile={(file) => removeFile('certificateOfRegistration', file)}
                                 />
                              )}
                              {formData.isWPPHolder && (
                                 <UploadCard
                                    label="Wood Processing Plant Permit"
                                    documentLabel="Upload Wood Processing Plant Permit"
                                    files={formData.files.woodProcessingPlantPermit}
                                    onFileChange={(e) => handleFileChange(e, 'woodProcessingPlantPermit')}
                                    onRemoveFile={(file) => removeFile('woodProcessingPlantPermit', file)}
                                 />
                              )}
                           </div>
                        </div>
                     )}

                     {currentStep === 4 && (
                        <div className="space-y-4">
                           <div className="space-y-5 h-[590px]">
                              <div>
                                 <h3 className="text-lg font-semibold mb-1 text-green-700 dark:text-green-500">Owner Details</h3>
                                 <div className="space-y-2">
                                    <div className="space-y-2">
                                       <Label htmlFor="ownerName" className="dark:text-white">Name</Label>
                                       <Input
                                          id="ownerName"
                                          name="ownerName"
                                          value={formData.ownerName}
                                          onChange={handleInputChange}
                                          placeholder="Full Name"
                                          required
                                          className="dark:bg-gray-700 dark:text-white"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <Label htmlFor="address" className="dark:text-white">Address</Label>
                                       <Input
                                          id="address"
                                          name="address"
                                          value={formData.address}
                                          onChange={handleInputChange}
                                          placeholder="Barangay, Bayan, Probinsya"
                                          required
                                          autoComplete="street-address"
                                          className="dark:bg-gray-700 dark:text-white"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <Label htmlFor="phone" className="dark:text-white">Phone Number</Label>
                                       <Input
                                          id="phone"
                                          name="phone"
                                          value={formData.phone}
                                          onChange={handleInputChange}
                                          placeholder="e.g. 09123456789"
                                          required
                                          autoComplete="tel"
                                          className="dark:bg-gray-700 dark:text-white"
                                       />
                                    </div>
                                 </div>
                              </div>
                              <div>
                                 <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-500">Chainsaw Details</h3>
                                 <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <Label htmlFor="brand" className="dark:text-white">Brand</Label>
                                          <Input
                                             id="brand"
                                             name="brand"
                                             value={formData.brand}
                                             onChange={handleInputChange}
                                             placeholder="Enter Brand"
                                             required
                                             className="dark:bg-gray-700 dark:text-white"
                                          />
                                       </div>
                                       <div>
                                          <Label htmlFor="model" className="dark:text-white">Model</Label>
                                          <Input
                                             id="model"
                                             name="model"
                                             value={formData.model}
                                             onChange={handleInputChange}
                                             placeholder="Enter Model"
                                             required
                                             className="dark:bg-gray-700 dark:text-white"
                                          />
                                       </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <Label htmlFor="serialNumber" className="dark:text-white">Serial No.</Label>
                                          <Input
                                             id="serialNumber"
                                             name="serialNumber"
                                             value={formData.serialNumber}
                                             onChange={handleInputChange}
                                             placeholder="Enter Serial Number"
                                             required
                                             className="dark:bg-gray-700 dark:text-white"
                                          />
                                       </div>
                                       <div>
                                          <Label htmlFor="dateOfAcquisition" className="dark:text-white">Date of Acquisition</Label>
                                          <CustomDatePicker
                                             selectedDate={formData.dateOfAcquisition}
                                             onChange={handleDateChange}
                                          />
                                       </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <Label htmlFor="powerOutput" className="dark:text-white">Power Output (kW/bhp)</Label>
                                          <Input
                                             id="powerOutput"
                                             name="powerOutput"
                                             value={formData.powerOutput}
                                             onChange={handleInputChange}
                                             placeholder="e.g. 5 kW or 6.7 bhp"
                                             required
                                             className="dark:bg-gray-700 dark:text-white"
                                          />
                                       </div>
                                       <div>
                                          <Label htmlFor="maxLengthGuidebar" className="dark:text-white">Maximum Length of Guidebar (Inches)</Label>
                                          <Input
                                             id="maxLengthGuidebar"
                                             name="maxLengthGuidebar"
                                             value={formData.maxLengthGuidebar}
                                             onChange={handleInputChange}
                                             placeholder="e.g. 20 inches"
                                             required
                                             className="dark:bg-gray-700 dark:text-white"
                                          />
                                       </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                                          <Input
                                             id="countryOfOrigin"
                                             name="countryOfOrigin"
                                             value={formData.countryOfOrigin}
                                             onChange={handleInputChange}
                                             placeholder="Enter Country of Origin"
                                             required
                                          />
                                       </div>
                                       <div>
                                          <Label htmlFor="purchasePrice">Purchase Price</Label>
                                          <Input
                                             id="purchasePrice"
                                             name="purchasePrice"
                                             type="number"
                                             value={formData.purchasePrice}
                                             onChange={handleInputChange}
                                             placeholder="Enter Purchase Price"
                                             required
                                          />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {currentStep === 5 && ( // Review Your Application
                        <div className="space-y-6 h-[590px] flex flex-col">
                           <div className="review-step-container csaw-form-scrollbar flex-grow overflow-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                 {Object.entries(formData)
                                    .filter(([key]) => key !== 'status' && key !== 'dateOfSubmission' && key !== 'files')
                                    .map(([key, value]) => (
                                       <div key={key} className="bg-background border rounded-lg p-3">
                                          <h4 className="font-semibold text-green-600 dark:text-green-500 mb-1 text-sm">{formatLabel(key)}</h4>
                                          <p className="text-foreground text-sm break-words">
                                             {formatReviewValue(key, value)}
                                          </p>
                                       </div>
                                    ))}
                              </div>

                              <div className="bg-background border rounded-lg p-3 mt-4">
                                 <h4 className="font-semibold text-green-600 dark:text-green-500 mb-2 text-sm">Uploaded Files</h4>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(formData.files).map(([docType, files]) => (
                                       <div key={docType} className="border-b dark:border-gray-700 pb-2">
                                          <h5 className="font-medium text-foreground mb-1 text-xs">{formatLabel(docType)}</h5>
                                          {files.length > 0 ? (
                                             <ul className="list-disc list-inside">
                                                {files.map((file, index) => (
                                                   <li key={index} className="text-xs text-muted-foreground truncate">{file.name}</li>
                                                ))}
                                             </ul>
                                          ) : (
                                             <p className="text-xs text-muted-foreground">No files uploaded</p>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                  </form>
               </CardContent>
               <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
                  <div className="w-full sm:w-auto">
                     {currentStep > 0 && (
                        <Button
                           type="button"
                           variant="outline"
                           onClick={handlePrevStep}
                           className="w-full sm:w-auto px-4 py-2"
                           disabled={isSubmitting || isSavingDraft}
                        >
                           Previous
                        </Button>
                     )}
                  </div>
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                     {currentStep < steps.length - 1 ? (
                        <Button
                           type="button"
                           onClick={handleNextStep}
                           className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                           disabled={isSubmitting || isSavingDraft}
                        >
                           Next
                        </Button>
                     ) : (
                        <>
                           <Button
                              type="button"
                              variant="outline"
                              onClick={handleSaveAsDraft}
                              className="w-full sm:w-auto px-4 py-2"
                              disabled={isSubmitting || isSavingDraft}
                           >
                              {isSavingDraft ? (
                                 <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                 </>
                              ) : (
                                 'Save as Draft'
                              )}
                           </Button>
                           <Button
                              type="submit"
                              onClick={handleSubmit}
                              className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
                              disabled={isSubmitting || isSavingDraft}
                           >
                              {isSubmitting ? (
                                 <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                 </>
                              ) : (
                                 'Submit Application'
                              )}
                           </Button>
                        </>
                     )}
                  </div>
               </CardFooter>
            </Card>
         </div>
         {/* <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
         /> */}
         <Modal
            isOpen={modalOpen}
            title={modalContent.title}
            message={modalContent.message}
            onClose={() => setModalOpen(false)}
            onHome={() => navigate('/home')}
            onApplications={() => navigate('/applicationsStatus')}
         />
      </div>
   );
};

export default ChainsawRegistrationForm;
