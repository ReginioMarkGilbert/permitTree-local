// PLTP or  SPLTP - Special/Private Land Timber Permit
//  ISSUANCE OF PRIVATE LAND TIMBER PERMIT (PLTP) FOR NON-PREMIUIM SPECIES,
// OR SPECIAL PLTP (SPLTP) FOR PREMIUM/ NATURALLY-GROWN TREES WITHIN PRIVATE/ TITLED LANDS

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Textarea } from '../../../../components/ui/Textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../../components/ui/Modal';
import { UploadCard } from '../CSAWForm/CSAWFormUtils';
import { gql, useMutation } from '@apollo/client';
import { formatLabel, formatReviewValue } from '../CSAWForm/CSAWFormUtils';
import '../../../../components/ui/styles/customScrollBar.css';

const CREATE_PLTP_PERMIT = gql`
  mutation CreatePLTPPermit($input: PLTPPermitInput!) {
    createPLTPPermit(input: $input) {
      id
      applicationNumber
      status
      dateOfSubmission
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

const SAVE_PLTP_PERMIT_DRAFT = gql`
  mutation SavePLTPPermitDraft($input: PLTPPermitInput!) {
    savePLTPPermitDraft(input: $input) {
      id
      applicationNumber
      status
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

const PLTPForm = () => {
   const navigate = useNavigate();
   const [currentStep, setCurrentStep] = useState(() => {
      const savedStep = localStorage.getItem('pltpFormStep');
      return savedStep ? parseInt(savedStep, 10) : 0;
   });
   const [formData, setFormData] = useState(() => {
      const savedFormData = localStorage.getItem('pltpFormData');
      return savedFormData ? JSON.parse(savedFormData) : {
         applicationType: 'Special/Private Land Timber Permit',
         name: '',
         address: '',
         contactNumber: '',
         plantedTrees: false,
         naturallyGrown: false,
         standing: false,
         blownDown: false,
         withinPrivateLand: false,
         withinTenuredForestLand: false,
         posingDanger: false,
         forPersonalUse: false,
         purpose: '',
         files: {
            letterOfIntent: [],
            lguEndorsement: [],
            titleCertificate: [],
            darCertificate: [],
            specialPowerOfAttorney: [],
            ptaResolution: []
         },
         dateOfSubmission: '',
         status: '',
      };
   });
   const [modalOpen, setModalOpen] = useState(false);
   const [modalContent, setModalContent] = useState({ title: '', message: '' });
   const [createPLTPPermit] = useMutation(CREATE_PLTP_PERMIT);
   const [savePLTPPermitDraft] = useMutation(SAVE_PLTP_PERMIT_DRAFT);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleCheckboxChange = (name) => {
      setFormData(prev => ({ ...prev, [name]: !prev[name] }));
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
      try {
         const input = {
            name: formData.name,
            address: formData.address,
            contactNumber: formData.contactNumber,
            plantedTrees: formData.plantedTrees,
            naturallyGrown: formData.naturallyGrown,
            standing: formData.standing,
            blownDown: formData.blownDown,
            withinPrivateLand: formData.withinPrivateLand,
            withinTenuredForestLand: formData.withinTenuredForestLand,
            posingDanger: formData.posingDanger,
            forPersonalUse: formData.forPersonalUse,
            purpose: formData.purpose,
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

         // Log the form data being saved as draft
         console.log('Saving draft with input:', input);

         const token = localStorage.getItem('token');
         const { data } = await savePLTPPermitDraft({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.savePLTPPermitDraft) {
            setModalContent({
               title: 'Draft saved successfully!',
               message: 'Do you want to view your applications?'
            });
            setModalOpen(true);

            localStorage.removeItem('pltpFormStep');
            localStorage.removeItem('pltpFormData');
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
            name: formData.name,
            address: formData.address,
            contactNumber: formData.contactNumber,
            plantedTrees: formData.plantedTrees,
            naturallyGrown: formData.naturallyGrown,
            standing: formData.standing,
            blownDown: formData.blownDown,
            withinPrivateLand: formData.withinPrivateLand,
            withinTenuredForestLand: formData.withinTenuredForestLand,
            posingDanger: formData.posingDanger,
            forPersonalUse: formData.forPersonalUse,
            purpose: formData.purpose,
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
         const { data } = await createPLTPPermit({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.createPLTPPermit) {
            setModalContent({
               title: 'Application submitted successfully!',
               message: 'Do you want to view your application?'
            });
            setModalOpen(true);

            localStorage.removeItem('pltpFormStep');
            localStorage.removeItem('pltpFormData');
         }
      } catch (error) {
         console.error('Error submitting application:', error);
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

   const steps = [
      { title: "Applicant Details", description: "Fill in your personal information" },
      { title: "Tree and Land Details", description: "Provide information about the trees and land" },
      { title: "Document Requirements", description: "Upload necessary documents" },
      { title: "Review Your Application", description: "Review and submit your application" },
   ];

   useEffect(() => {
      localStorage.setItem('pltpFormStep', currentStep.toString());
   }, [currentStep]);

   useEffect(() => {
      localStorage.setItem('pltpFormData', JSON.stringify(formData));
   }, [formData]);

   useEffect(() => {
      return () => {
         localStorage.removeItem('pltpFormStep');
         localStorage.removeItem('pltpFormData');
      };
   }, []);

   return (
      <div className="min-h-screen bg-green-50 flex flex-col justify-between pt-[83px]">
         <div className="container mx-auto px-4 flex-grow">
            <h1 className="text-3xl font-[700] text-green-800 mb-6 text-center">Special/Private Land Timber Permit Application</h1>
            <Card className="max-w-2xl mx-auto shadow-lg">
               <CardHeader>
                  <CardTitle>{steps[currentStep].title}</CardTitle>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit}>
                     {currentStep === 0 && (
                        <div className="space-y-4">
                           <div>
                              <Label htmlFor="name">Name</Label>
                              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                           </div>
                           <div>
                              <Label htmlFor="address">Address</Label>
                              <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                           </div>
                           <div>
                              <Label htmlFor="contactNumber">Contact Number</Label>
                              <Input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} required />
                           </div>
                        </div>
                     )}

                     {currentStep === 1 && (
                        <div className="space-y-6">
                           <div>
                              <Label className="text-lg font-semibold text-green-700">Tree Type</Label>
                              <div className="mt-2 space-y-2">
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                       id="plantedTrees"
                                       checked={formData.plantedTrees}
                                       onCheckedChange={() => handleCheckboxChange('plantedTrees')}
                                    />
                                    <Label htmlFor="plantedTrees" className="text-sm font-medium">Planted Trees</Label>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                       id="naturallyGrown"
                                       checked={formData.naturallyGrown}
                                       onCheckedChange={() => handleCheckboxChange('naturallyGrown')}
                                    />
                                    <Label htmlFor="naturallyGrown" className="text-sm font-medium">Naturally Grown</Label>
                                 </div>
                              </div>
                           </div>

                           <div>
                              <Label className="text-lg font-semibold text-green-700">Tree Status</Label>
                              <div className="mt-2 space-y-2">
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                       id="standing"
                                       checked={formData.standing}
                                       onCheckedChange={() => handleCheckboxChange('standing')}
                                    />
                                    <Label htmlFor="standing" className="text-sm font-medium">Standing</Label>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                       id="blownDown"
                                       checked={formData.blownDown}
                                       onCheckedChange={() => handleCheckboxChange('blownDown')}
                                    />
                                    <Label htmlFor="blownDown" className="text-sm font-medium">Blown Down</Label>
                                 </div>
                              </div>
                           </div>

                           <div>
                              <Label className="text-lg font-semibold text-green-700">Land Type</Label>
                              <div className="mt-2 space-y-2">
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                       id="withinPrivateLand"
                                       checked={formData.withinPrivateLand}
                                       onCheckedChange={() => handleCheckboxChange('withinPrivateLand')}
                                    />
                                    <Label htmlFor="withinPrivateLand" className="text-sm font-medium">Within Private Land</Label>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                       id="withinTenuredForestLand"
                                       checked={formData.withinTenuredForestLand}
                                       onCheckedChange={() => handleCheckboxChange('withinTenuredForestLand')}
                                    />
                                    <Label htmlFor="withinTenuredForestLand" className="text-sm font-medium">Within Tenured Forest Land</Label>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <Label className="text-lg font-semibold text-green-700">Additional Characteristics</Label>
                              <div className="flex items-center space-x-2 mt-2">
                                 <Checkbox
                                    id="posingDanger"
                                    checked={formData.posingDanger}
                                    onCheckedChange={() => handleCheckboxChange('posingDanger')}
                                 />
                                 <Label htmlFor="posingDanger" className="text-sm font-medium">Posing Danger</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <Checkbox
                                    id="forPersonalUse"
                                    checked={formData.forPersonalUse}
                                    onCheckedChange={() => handleCheckboxChange('forPersonalUse')}
                                 />
                                 <Label htmlFor="forPersonalUse" className="text-sm font-medium">For Personal Use</Label>
                              </div>
                           </div>

                           <div>
                              <Label htmlFor="purpose" className="text-lg font-semibold text-green-700">Purpose</Label>
                              <Textarea
                                 id="purpose"
                                 name="purpose"
                                 value={formData.purpose}
                                 onChange={handleInputChange}
                                 required
                                 className="mt-2"
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
                                 label="Title Certificate"
                                 documentLabel="Upload Original Certification of Title/Transfer certificate of Title (Authenticated or Certified Copy)"
                                 files={formData.files.titleCertificate}
                                 onFileChange={(e) => handleFileChange(e, 'titleCertificate')}
                                 onRemoveFile={(file) => removeFile('titleCertificate', file)}
                              />
                              <UploadCard
                                 label="DAR Certificate"
                                 documentLabel="Upload Department of Agrarian Reform (DAR) Certificate/Clearance (if the Title is Certificate of Land Ownership Award)"
                                 files={formData.files.darCertificate}
                                 onFileChange={(e) => handleFileChange(e, 'darCertificate')}
                                 onRemoveFile={(file) => removeFile('darCertificate', file)}
                              />
                              <UploadCard
                                 label="Special Power of Attorney"
                                 documentLabel="Upload Special Power of Attorney (if representative)"
                                 files={formData.files.specialPowerOfAttorney}
                                 onFileChange={(e) => handleFileChange(e, 'specialPowerOfAttorney')}
                                 onRemoveFile={(file) => removeFile('specialPowerOfAttorney', file)}
                              />
                              <UploadCard
                                 label="PTA Resolution"
                                 documentLabel="Upload PTA Resolution or Resolution from any organize group of No Objection and Reason for Cutting (1 original) (If School/Organization)"
                                 files={formData.files.ptaResolution}
                                 onFileChange={(e) => handleFileChange(e, 'ptaResolution')}
                                 onRemoveFile={(file) => removeFile('ptaResolution', file)}
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
                                       <div key={key} className="bg-white p-3 rounded-lg shadow">
                                          <h4 className="font-semibold text-green-600 mb-1 text-sm">{formatLabel(key)}</h4>
                                          <p className="text-gray-700 text-sm">
                                             {formatReviewValue(key, value)}
                                          </p>
                                       </div>
                                    ))}
                              </div>

                              <div className="bg-white p-3 rounded-lg shadow mt-4">
                                 <h4 className="font-semibold text-green-600 mb-2 text-sm">Uploaded Files</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.entries(formData.files).map(([docType, files]) => (
                                       <div key={docType} className="border-b pb-2">
                                          <h5 className="font-medium text-gray-700 mb-1 text-xs">{formatLabel(docType)}</h5>
                                          {files.length > 0 ? (
                                             <ul className="list-disc list-inside">
                                                {files.map((file, index) => (
                                                   <li key={index} className="text-xs text-gray-600">{file.name}</li>
                                                ))}
                                             </ul>
                                          ) : (
                                             <p className="text-xs text-gray-500">No files uploaded</p>
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
                           >
                              Save as Draft
                           </Button>
                           <Button
                              type="submit"
                              onClick={handleSubmit}
                              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                           >
                              Submit Application
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

export default PLTPForm;
