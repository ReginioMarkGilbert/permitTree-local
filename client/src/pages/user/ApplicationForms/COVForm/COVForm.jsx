// COV - Certificate of Verification
// CERTIFICATE OF VERIFICATION (COV) FOR THE TRANSPORT OF PLANTED TREES WITHIN PRIVATE LAND, NON-TIMBER FOREST PRODUCTS EXCEPT RATTAN AND BAMBOO
// COV is a document to be presented when transporting planted trees within private lands not registered under the Private Tree Plantation Registration and/or non-premium trees, non-timber forest products (except rattan and bamboo)

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/modal';
import { UploadCard } from '@/pages/user/ApplicationForms/CSAWForm/CSAWFormUtils';
import { gql, useMutation } from '@apollo/client';
import { formatLabel, formatReviewValue } from '@/pages/user/ApplicationForms/CSAWForm/CSAWFormUtils';
import '@/components/ui/styles/customScrollBar.css';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from "lucide-react";

const CREATE_COV_PERMIT = gql`
  mutation CreateCOVPermit($input: COVPermitInput!) {
    createCOVPermit(input: $input) {
      id
      applicationNumber
      status
      dateOfSubmission
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

const SAVE_COV_PERMIT_DRAFT = gql`
  mutation SaveCOVPermitDraft($input: COVPermitInput!) {
    saveCOVPermitDraft(input: $input) {
      id
      applicationNumber
      status
      dateOfSubmission
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

const COVForm = () => {
   const navigate = useNavigate();
   const [currentStep, setCurrentStep] = useState(() => {
      const savedStep = localStorage.getItem('covFormStep');
      return savedStep ? parseInt(savedStep, 10) : 0;
   });
   const [formData, setFormData] = useState(() => {
      const savedFormData = localStorage.getItem('covFormData');
      return savedFormData ? JSON.parse(savedFormData) : {
         applicationType: 'Certificate of Verification',
         name: '',
         address: '',
         cellphone: '',
         purpose: '',
         driverName: '',
         driverLicenseNumber: '',
         vehiclePlateNumber: '',
         originAddress: '',
         destinationAddress: '',
         files: {
            letterOfIntent: [],
            tallySheet: [],
            forestCertification: [],
            orCr: [],
            driverLicense: [],
            specialPowerOfAttorney: []
         },
         dateOfSubmission: '',
         status: '',
      };
   });
   const [modalOpen, setModalOpen] = useState(false);
   const [modalContent, setModalContent] = useState({ title: '', message: '' });
   const [createCOVPermit] = useMutation(CREATE_COV_PERMIT);
   const [saveCOVPermitDraft] = useMutation(SAVE_COV_PERMIT_DRAFT);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSavingDraft, setIsSavingDraft] = useState(false);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
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
      // Add validation logic here
      setCurrentStep(prev => prev + 1);
   };

   const handlePrevStep = () => {
      setCurrentStep(prev => prev - 1);
   };

   const handleSaveAsDraft = async () => {
      setIsSavingDraft(true);
      try {
         const input = {
            name: formData.name,
            address: formData.address,
            cellphone: formData.cellphone,
            purpose: formData.purpose,
            driverName: formData.driverName,
            driverLicenseNumber: formData.driverLicenseNumber,
            vehiclePlateNumber: formData.vehiclePlateNumber,
            originAddress: formData.originAddress,
            destinationAddress: formData.destinationAddress,
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

         const token = localStorage.getItem('token');
         const { data } = await saveCOVPermitDraft({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.saveCOVPermitDraft) {
            setModalContent({
               title: 'Draft saved successfully!',
               message: 'Do you want to view your applications?'
            });
            setModalOpen(true);

            localStorage.removeItem('covFormStep');
            localStorage.removeItem('covFormData');
         }
      } catch (error) {
         console.error('Error saving draft:', error);
         toast.error("Error saving draft: " + error.message);
      } finally {
         setIsSavingDraft(false);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
         const input = {
            name: formData.name,
            address: formData.address,
            cellphone: formData.cellphone,
            purpose: formData.purpose,
            driverName: formData.driverName,
            driverLicenseNumber: formData.driverLicenseNumber,
            vehiclePlateNumber: formData.vehiclePlateNumber,
            originAddress: formData.originAddress,
            destinationAddress: formData.destinationAddress,
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
         const { data } = await createCOVPermit({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.createCOVPermit) {
            setModalContent({
               title: 'Application submitted successfully!',
               message: 'Do you want to view your application?'
            });
            setModalOpen(true);

            localStorage.removeItem('covFormStep');
            localStorage.removeItem('covFormData');
         }
      } catch (error) {
         console.error('Error submitting application:', error);
         toast.error("Error submitting application: " + error.message);
      } finally {
         setIsSubmitting(false);
      }
   };

   // Make sure this helper function is defined
   const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result.split(',')[1]);
         reader.onerror = error => reject(error);
         reader.readAsDataURL(file);
      });
   };

   const steps = [
      { title: "Application Details", description: "Fill in applicant, driver, and transport details" },
      { title: "Required Documents", description: "Upload necessary documents" },
      { title: "Additional Documents", description: "Upload additional documents" },
      { title: "Review Your Application", description: "Review and submit your application" },
   ];

   useEffect(() => {
      localStorage.setItem('covFormStep', currentStep.toString());
   }, [currentStep]);

   useEffect(() => {
      localStorage.setItem('covFormData', JSON.stringify(formData));
   }, [formData]);

   useEffect(() => {
      return () => {
         localStorage.removeItem('covFormStep');
         localStorage.removeItem('covFormData');
      };
   }, []);

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex flex-col justify-between pt-[83px]">
         <div className="container mx-auto px-4 flex-grow">
            <h1 className="text-3xl font-[700] text-green-800 dark:text-green-500 mb-6 text-center">
               Certificate of Verification Application
            </h1>
            <Card className="max-w-2xl mx-auto shadow-lg bg-background">
               <CardHeader>
                  <CardTitle className="text-foreground">{steps[currentStep].title}</CardTitle>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit}>
                     {currentStep === 0 && (
                        <div className="space-y-4">
                           <div className="space-y-5 h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                              <div>
                                 <div className="pl-2 space-y-2">
                                    <div>
                                       <Label htmlFor="name" className="text-foreground">Name</Label>
                                       <Input
                                          id="name"
                                          name="name"
                                          value={formData.name}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Full Name"
                                          className="bg-background"
                                       />
                                    </div>
                                    <div>
                                       <Label htmlFor="address" className="text-foreground">Address</Label>
                                       <Input
                                          id="address"
                                          name="address"
                                          value={formData.address}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Barangay, Bayan, Probinsya"
                                          className="bg-background"
                                       />
                                    </div>
                                    <div>
                                       <Label htmlFor="cellphone" className="text-foreground">Cellphone</Label>
                                       <Input
                                          id="cellphone"
                                          name="cellphone"
                                          value={formData.cellphone}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="e.g. 09123456789"
                                          className="bg-background"
                                       />
                                    </div>
                                    <div>
                                       <Label htmlFor="purpose" className="text-foreground">Purpose</Label>
                                       <Textarea
                                          id="purpose"
                                          name="purpose"
                                          value={formData.purpose}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Describe the purpose of transport"
                                          className="min-h-[100px] bg-background"
                                       />
                                    </div>
                                 </div>
                              </div>
                              <div>
                                 <h3 className="pl-2 text-lg font-semibold mb-1 text-green-700 dark:text-green-500">Driver Information</h3>
                                 <div className="pl-2 space-y-2">
                                    <div>
                                       <Label htmlFor="driverName" className="text-foreground">Driver Name</Label>
                                       <Input
                                          id="driverName"
                                          name="driverName"
                                          value={formData.driverName}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Full Name of Driver"
                                          className="bg-background"
                                       />
                                    </div>
                                    <div>
                                       <Label htmlFor="driverLicenseNumber" className="text-foreground">Driver License Number</Label>
                                       <Input
                                          id="driverLicenseNumber"
                                          name="driverLicenseNumber"
                                          value={formData.driverLicenseNumber}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Enter License Number"
                                          className="bg-background"
                                       />
                                    </div>
                                    <div>
                                       <Label htmlFor="vehiclePlateNumber" className="text-foreground">Vehicle Plate Number</Label>
                                       <Input
                                          id="vehiclePlateNumber"
                                          name="vehiclePlateNumber"
                                          value={formData.vehiclePlateNumber}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Enter Plate Number"
                                          className="bg-background"
                                       />
                                    </div>
                                 </div>
                              </div>
                              <div>
                                 <h3 className="pl-2 text-lg font-semibold mb-1 text-green-700 dark:text-green-500">Transport Details</h3>
                                 <div className="pl-2 space-y-2">
                                    <div>
                                       <Label htmlFor="originAddress" className="text-foreground">Origin Address</Label>
                                       <Input
                                          id="originAddress"
                                          name="originAddress"
                                          value={formData.originAddress}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Enter Origin Address"
                                          className="bg-background"
                                       />
                                    </div>
                                    <div>
                                       <Label htmlFor="destinationAddress" className="text-foreground">Destination Address</Label>
                                       <Input
                                          id="destinationAddress"
                                          name="destinationAddress"
                                          value={formData.destinationAddress}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Enter Destination Address"
                                          className="bg-background"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {(currentStep === 1 || currentStep === 2) && (
                        <div className="space-y-4">
                           <UploadCard
                              label="Letter of Intent"
                              documentLabel="Upload Letter of Intent"
                              files={formData.files.letterOfIntent}
                              onFileChange={(e) => handleFileChange(e, 'letterOfIntent')}
                              onRemoveFile={(file) => removeFile('letterOfIntent', file)}
                           />
                           <UploadCard
                              label="Tally Sheet"
                              documentLabel="Upload Tally Sheet"
                              files={formData.files.tallySheet}
                              onFileChange={(e) => handleFileChange(e, 'tallySheet')}
                              onRemoveFile={(file) => removeFile('tallySheet', file)}
                           />
                           <UploadCard
                              label="Forest Certification"
                              documentLabel={<>Certification that the forest products are harvested within the area of the owner <strong>(For Non Timber)</strong></>}
                              files={formData.files.forestCertification}
                              onFileChange={(e) => handleFileChange(e, 'forestCertification')}
                              onRemoveFile={(file) => removeFile('forestCertification', file)}
                           />
                        </div>
                     )}

                     {currentStep === 3 && (
                        <div className="space-y-6 h-[630px] flex flex-col">
                           <div className="review-step-container custom-scrollbar flex-grow overflow-auto">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {Object.entries(formData)
                                    .filter(([key]) => key !== 'status' && key !== 'dateOfSubmission' && key !== 'files')
                                    .map(([key, value]) => (
                                       <div key={key} className="bg-background border rounded-lg p-3">
                                          <h4 className="font-semibold text-green-600 dark:text-green-500 mb-1 text-sm">
                                             {formatLabel(key)}
                                          </h4>
                                          <p className="text-foreground text-sm">
                                             {formatReviewValue(key, value)}
                                          </p>
                                       </div>
                                    ))}
                              </div>

                              <div className="bg-background border rounded-lg p-3 mt-4">
                                 <h4 className="font-semibold text-green-600 dark:text-green-500 mb-2 text-sm">
                                    Uploaded Files
                                 </h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.entries(formData.files).map(([docType, files]) => (
                                       <div key={docType} className="border-b dark:border-gray-700 pb-2">
                                          <h5 className="font-medium text-foreground mb-1 text-xs">
                                             {formatLabel(docType)}
                                          </h5>
                                          {files.length > 0 ? (
                                             <ul className="list-disc list-inside">
                                                {files.map((file, index) => (
                                                   <li key={index} className="text-xs text-muted-foreground">
                                                      {file.name}
                                                   </li>
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
               <CardFooter className="mt-14 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="w-full sm:w-auto">
                     {currentStep > 0 && (
                        <Button
                           type="button"
                           variant="outline"
                           onClick={handlePrevStep}
                           className="w-full sm:w-auto"
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
                           className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
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
                              className="w-full sm:w-auto"
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
                              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
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

export default COVForm;
