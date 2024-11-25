// TCEBP - Tree Cutting and/or Earth Balling Permit for National Government Agencies
//
// ISSUANCE OF TREE CUTTING AND/OR EARTH BALLING PERMIT FOR TREES AFFECTED BY PROJECTS OF NATIONAL GOVERNMENT AGENCIES (DPWH, DOTR, DepEd, DA, DOH, CHED, DOE, and NIA)
// This Permit serves as proof of authorization for the removal/cutting and/or relocation of trees affected by projects of the National Government Agencies (DPWH, DOTR, DepEd, DA, DOH, CHED, DOE and NIA)

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/modal';
import { UploadCard } from '@/pages/user/ApplicationForms/CSAWForm/CSAWFormUtils';
import { gql, useMutation } from '@apollo/client';
import { formatLabel, formatReviewValue } from '@/pages/user/ApplicationForms/CSAWForm/CSAWFormUtils';
import '@/components/ui/styles/customScrollBar.css';
import { Loader2 } from "lucide-react";

const CREATE_TCEBP_PERMIT = gql`
  mutation CreateTCEBPPermit($input: TCEBPPermitInput!) {
    createTCEBPPermit(input: $input) {
      id
      applicationNumber
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

const SAVE_TCEBP_PERMIT_DRAFT = gql`
  mutation SaveTCEBPPermitDraft($input: TCEBPPermitInput!) {
    saveTCEBPPermitDraft(input: $input) {
      id
      applicationNumber
      status
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

const TCEBPForm = () => {
   const navigate = useNavigate();
   const [currentStep, setCurrentStep] = useState(() => {
      const savedStep = localStorage.getItem('tcebpFormStep');
      return savedStep ? parseInt(savedStep, 10) : 0;
   });
   const [formData, setFormData] = useState(() => {
      const savedFormData = localStorage.getItem('tcebpFormData');
      return savedFormData ? JSON.parse(savedFormData) : {
         applicationType: 'Tree Cutting and/or Earth Balling Permit',
         requestType: '',
         name: '',
         address: '',
         contactNumber: '',
         purpose: '',
         files: {
            letterOfIntent: [],
            lguEndorsement: [],
            landTenurial: [],
            siteDevelopmentPlan: [],
            environmentalCompliance: [],
            fpic: [],
            ownerConsent: [],
            pambClearance: []
         },
         dateOfSubmission: '',
         status: '',
      };
   });
   const [modalOpen, setModalOpen] = useState(false);
   const [modalContent, setModalContent] = useState({ title: '', message: '' });
   const [createTCEBPPermit] = useMutation(CREATE_TCEBP_PERMIT);
   const [saveTCEBPPermitDraft] = useMutation(SAVE_TCEBP_PERMIT_DRAFT);
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
            contactNumber: formData.contactNumber,
            purpose: formData.purpose,
            requestType: formData.requestType,
            files: {}
         };

         // Process files - only include metadata for drafts
         for (const [key, files] of Object.entries(formData.files)) {
            if (files.length > 0) {
               input.files[key] = files.map(file => ({
                  filename: file.name,
                  contentType: file.type
               }));
            }
         }

         console.log('Saving draft with input:', input);

         const token = localStorage.getItem('token');
         const { data } = await saveTCEBPPermitDraft({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.saveTCEBPPermitDraft) {
            setModalContent({
               title: 'Draft saved successfully!',
               message: 'Do you want to view your applications?'
            });
            setModalOpen(true);

            localStorage.removeItem('tcebpFormStep');
            localStorage.removeItem('tcebpFormData');
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
            contactNumber: formData.contactNumber,
            purpose: formData.purpose,
            requestType: formData.requestType, // Add this line
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
         const { data } = await createTCEBPPermit({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.createTCEBPPermit) {
            setModalContent({
               title: 'Application submitted successfully!',
               message: 'Do you want to view your application?'
            });
            setModalOpen(true);

            localStorage.removeItem('tcebpFormStep');
            localStorage.removeItem('tcebpFormData');
         }
      } catch (error) {
         console.error('Error submitting application:', error);
         toast.error("Error submitting application: " + error.message);
      } finally {
         setIsSubmitting(false);
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

   const steps = [
      { title: "Select Request Type", description: "Choose the type of request" },
      { title: "Applicant Details", description: "Fill in your personal information" },
      { title: "Document Requirements", description: "Upload necessary documents" },
      { title: "Review Your Application", description: "Review and submit your application" },
   ];

   useEffect(() => {
      localStorage.setItem('tcebpFormStep', currentStep.toString());
   }, [currentStep]);

   useEffect(() => {
      localStorage.setItem('tcebpFormData', JSON.stringify(formData));
   }, [formData]);

   useEffect(() => {
      return () => {
         localStorage.removeItem('tcebpFormStep');
         localStorage.removeItem('tcebpFormData');
      };
   }, []);

   return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex flex-col justify-between pt-[83px]">
         <div className="container mx-auto px-4 flex-grow">
            <h1 className="text-3xl font-[700] text-green-800 dark:text-green-500 mb-6 text-center">
               Tree Cutting and/or Earth Balling Permit Application
            </h1>
            <Card className="max-w-2xl mx-auto shadow-lg bg-background">
               <CardHeader>
                  <CardTitle className="text-foreground">{steps[currentStep].title}</CardTitle>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit}>
                     {currentStep === 0 && (
                        <div className="space-y-4">
                           <Label className="text-foreground">Select Request Type</Label>
                           <RadioGroup
                              name="requestType"
                              value={formData.requestType}
                              onValueChange={(value) => handleInputChange({ target: { name: 'requestType', value } })}
                              className="space-y-4"
                           >
                              <div className="flex items-center space-x-2 p-4 rounded-lg border border-input bg-background hover:bg-accent">
                                 <RadioGroupItem value="Cutting" id="Cutting" />
                                 <Label htmlFor="Cutting" className="flex-grow text-foreground">
                                    Request for Cutting/Earth balling (NGA's)
                                 </Label>
                              </div>
                              <div className="flex items-center space-x-2 p-4 rounded-lg border border-input bg-background hover:bg-accent">
                                 <RadioGroupItem value="Inventory" id="Inventory" />
                                 <Label htmlFor="Inventory" className="flex-grow text-foreground">
                                    Request for Inventory for Cutting/Earth Balling (NGA'S)
                                 </Label>
                              </div>
                           </RadioGroup>
                        </div>
                     )}

                     {currentStep === 1 && (
                        <div className="space-y-4">
                           <div>
                              <Label htmlFor="name" className="text-foreground">Name</Label>
                              <Input
                                 id="name"
                                 name="name"
                                 value={formData.name}
                                 onChange={handleInputChange}
                                 required
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
                                 className="bg-background"
                              />
                           </div>
                           <div>
                              <Label htmlFor="contactNumber" className="text-foreground">Contact Number</Label>
                              <Input
                                 id="contactNumber"
                                 name="contactNumber"
                                 value={formData.contactNumber}
                                 onChange={handleInputChange}
                                 required
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
                                 className="min-h-[100px] bg-background"
                              />
                           </div>
                        </div>
                     )}

                     {currentStep === 2 && (
                        <div className="space-y-4">
                           <div className="h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                              <UploadCard
                                 label="Letter of Intent"
                                 documentLabel="Upload Letter of Intent (1 original)"
                                 files={formData.files.letterOfIntent}
                                 onFileChange={(e) => handleFileChange(e, 'letterOfIntent')}
                                 onRemoveFile={(file) => removeFile('letterOfIntent', file)}
                              />
                              <UploadCard
                                 label="LGU Endorsement"
                                 documentLabel="Upload LGU Endorsement/Certification of No Objection from Sanguninian (Barangay or Municipal) (1 original)"
                                 files={formData.files.lguEndorsement}
                                 onFileChange={(e) => handleFileChange(e, 'lguEndorsement')}
                                 onRemoveFile={(file) => removeFile('lguEndorsement', file)}
                              />
                              <UploadCard
                                 label="Land Tenurial Instrument"
                                 documentLabel="Upload Approved Land Tenurial Instrument (LTI)/Special Land Use Permit (SLUP), if within timberland (1 photocopy)"
                                 files={formData.files.landTenurial}
                                 onFileChange={(e) => handleFileChange(e, 'landTenurial')}
                                 onRemoveFile={(file) => removeFile('landTenurial', file)}
                              />
                              <UploadCard
                                 label="Site Development Plan"
                                 documentLabel="Upload Approved Site Development Plan/Infrastructure Plan with tree charting (1 original)"
                                 files={formData.files.siteDevelopmentPlan}
                                 onFileChange={(e) => handleFileChange(e, 'siteDevelopmentPlan')}
                                 onRemoveFile={(file) => removeFile('siteDevelopmentPlan', file)}
                              />
                              <UploadCard
                                 label="Environmental Compliance"
                                 documentLabel="Upload Certificate of Non-Coverage or Environmental Compliance Certificate (CNC/ECC) (1 photocopy)"
                                 files={formData.files.environmentalCompliance}
                                 onFileChange={(e) => handleFileChange(e, 'environmentalCompliance')}
                                 onRemoveFile={(file) => removeFile('environmentalCompliance', file)}
                              />
                              <UploadCard
                                 label="FPIC"
                                 documentLabel="Upload Free, Prior and Informed Consent (FPIC) (if applicable)"
                                 files={formData.files.fpic}
                                 onFileChange={(e) => handleFileChange(e, 'fpic')}
                                 onRemoveFile={(file) => removeFile('fpic', file)}
                              />
                              <UploadCard
                                 label="Owner's Consent"
                                 documentLabel="Upload Waiver/consent of owner's (if titled property) (1 original)"
                                 files={formData.files.ownerConsent}
                                 onFileChange={(e) => handleFileChange(e, 'ownerConsent')}
                                 onRemoveFile={(file) => removeFile('ownerConsent', file)}
                              />
                              <UploadCard
                                 label="PAMB Clearance"
                                 documentLabel="Upload PAMB Clearance/Resolution (if within Protected Area) (1 original)"
                                 files={formData.files.pambClearance}
                                 onFileChange={(e) => handleFileChange(e, 'pambClearance')}
                                 onRemoveFile={(file) => removeFile('pambClearance', file)}
                              />
                           </div>
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

export default TCEBPForm;
