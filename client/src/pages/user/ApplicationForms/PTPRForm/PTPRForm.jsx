// PTPR - Private Tree Plantation Registration
// This Certificate shows the ownership of plantations or planted trees within private, titled lands or tax declared alienable and
// disposable lands. The issuance of PTPR requires inventory and ocular inspection in the area. Tree inventory for permits (e.g. TCP or PLTP)
// is a process conducted separately from the inspection for PTPR per existing DENR policies, rules and regulations.

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../../components/ui/Modal';
import { UploadCard } from '../CSAWForm/CSAWFormUtils';
import { gql, useMutation } from '@apollo/client';
import { formatLabel, formatReviewValue } from '../CSAWForm/CSAWFormUtils';
import '../../../../components/ui/styles/customScrollBar.css';

const CREATE_PTPR_PERMIT = gql`
  mutation CreatePTPRPermit($input: PTPRPermitInput!) {
    createPTPRPermit(input: $input) {
      id
      applicationNumber
      status
      dateOfSubmission
      files {
        letterRequest { filename contentType }
        titleOrTaxDeclaration { filename contentType }
        darCertification { filename contentType }
        specialPowerOfAttorney { filename contentType }
      }
    }
  }
`;

const SAVE_PTPR_PERMIT_DRAFT = gql`
  mutation SavePTPRPermitDraft($input: PTPRPermitInput!) {
    savePTPRPermitDraft(input: $input) {
      id
      applicationNumber
      status
      files {
        letterRequest { filename contentType }
        titleOrTaxDeclaration { filename contentType }
        darCertification { filename contentType }
        specialPowerOfAttorney { filename contentType }
      }
    }
  }
`;

const PTPRForm = () => {
   const navigate = useNavigate();
   const [currentStep, setCurrentStep] = useState(() => {
      const savedStep = localStorage.getItem('ptprFormStep');
      return savedStep ? parseInt(savedStep, 10) : 0;
   });
   const [formData, setFormData] = useState(() => {
      const savedFormData = localStorage.getItem('ptprFormData');
      return savedFormData ? JSON.parse(savedFormData) : {
         applicationType: 'Private Tree Plantation Registration',
         ownerName: '',
         address: '',
         contactNumber: '',
         lotArea: '',
         treeSpecies: [],
         totalTrees: '',
         treeSpacing: '',
         yearPlanted: '',
         files: {
            letterRequest: [],
            titleOrTaxDeclaration: [],
            darCertification: [],
            specialPowerOfAttorney: []
         },
         dateOfSubmission: '',
         status: '',
      };
   });
   const [modalOpen, setModalOpen] = useState(false);
   const [modalContent, setModalContent] = useState({ title: '', message: '' });
   const [createPTPRPermit] = useMutation(CREATE_PTPR_PERMIT);
   const [savePTPRPermitDraft] = useMutation(SAVE_PTPR_PERMIT_DRAFT);

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
      try {
         const input = {
            ownerName: formData.ownerName,
            address: formData.address,
            contactNumber: formData.contactNumber,
            lotArea: parseFloat(formData.lotArea),
            treeSpecies: formData.treeSpecies,
            totalTrees: parseInt(formData.totalTrees, 10),
            treeSpacing: formData.treeSpacing,
            yearPlanted: parseInt(formData.yearPlanted, 10),
            files: {}
         };

         // Process files
         for (const [key, files] of Object.entries(formData.files)) {
            if (files && files.length > 0) {
               input.files[key] = await Promise.all(files.map(async file => ({
                  filename: file.name,
                  contentType: file.type,
                  data: await readFileAsBase64(file)
               })));
            } else {
               input.files[key] = []; // Use an empty array if no files
            }
         }

         const token = localStorage.getItem('token');
         const { data } = await savePTPRPermitDraft({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.savePTPRPermitDraft) {
            setModalContent({
               title: 'Draft saved successfully!',
               message: 'Do you want to view your applications?'
            });
            setModalOpen(true);

            localStorage.removeItem('ptprFormStep');
            localStorage.removeItem('ptprFormData');
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
            ownerName: formData.ownerName,
            address: formData.address,
            contactNumber: formData.contactNumber,
            lotArea: parseFloat(formData.lotArea),
            treeSpecies: formData.treeSpecies,
            totalTrees: parseInt(formData.totalTrees, 10),
            treeSpacing: formData.treeSpacing,
            yearPlanted: parseInt(formData.yearPlanted, 10),
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
         const { data } = await createPTPRPermit({
            variables: { input },
            context: {
               headers: {
                  'Apollo-Require-Preflight': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            },
         });

         if (data.createPTPRPermit) {
            setModalContent({
               title: 'Application submitted successfully!',
               message: 'Do you want to view your application?'
            });
            setModalOpen(true);

            localStorage.removeItem('ptprFormStep');
            localStorage.removeItem('ptprFormData');
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
      { title: "Owner Details", description: "Fill in owner information" },
      { title: "Plantation Details", description: "Provide plantation information" },
      { title: "Document Requirements", description: "Upload necessary documents" },
      { title: "Review Your Application", description: "Review and submit your application" },
   ];

   useEffect(() => {
      localStorage.setItem('ptprFormStep', currentStep.toString());
   }, [currentStep]);

   useEffect(() => {
      localStorage.setItem('ptprFormData', JSON.stringify(formData));
   }, [formData]);

   useEffect(() => {
      return () => {
         localStorage.removeItem('ptprFormStep');
         localStorage.removeItem('ptprFormData');
      };
   }, []);

   return (
      <div className="min-h-screen bg-green-50 flex flex-col justify-between pt-[83px]">
         <div className="container mx-auto px-4 flex-grow">
            <h1 className="text-3xl font-[700] text-green-800 mb-6 text-center">Private Tree Plantation Registration</h1>
            <Card className="max-w-2xl mx-auto shadow-lg">
               <CardHeader>
                  <CardTitle>{steps[currentStep].title}</CardTitle>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit}>
                     {currentStep === 0 && (
                        <div className="space-y-4">
                           <div>
                              <Label htmlFor="ownerName">Name of Lot Owner</Label>
                              <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleInputChange} required />
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
                        <div className="space-y-4">
                           <div>
                              <Label htmlFor="lotArea">Lot area devoted to plantation (in hectares)</Label>
                              <Input
                                 id="lotArea"
                                 name="lotArea"
                                 type="number"
                                 step="0.01" // Allow decimal numbers
                                 value={formData.lotArea}
                                 onChange={handleInputChange}
                                 required
                              />
                           </div>
                           <div>
                              <Label htmlFor="treeSpecies">Tree Species Planted (comma-separated)</Label>
                              <Input id="treeSpecies" name="treeSpecies" value={formData.treeSpecies.join(', ')} onChange={(e) => setFormData(prev => ({ ...prev, treeSpecies: e.target.value.split(',').map(s => s.trim()) }))} required />
                           </div>
                           <div>
                              <Label htmlFor="totalTrees">Total No. of Trees Planted</Label>
                              <Input
                                 id="totalTrees"
                                 name="totalTrees"
                                 type="number"
                                 value={formData.totalTrees}
                                 onChange={handleInputChange}
                                 required
                              />
                           </div>
                           <div>
                              <Label htmlFor="treeSpacing">Spacing of trees</Label>
                              <Input id="treeSpacing" name="treeSpacing" value={formData.treeSpacing} onChange={handleInputChange} required />
                           </div>
                           <div>
                              <Label htmlFor="yearPlanted">Year Planted</Label>
                              <Input
                                 id="yearPlanted"
                                 name="yearPlanted"
                                 type="number"
                                 value={formData.yearPlanted}
                                 onChange={handleInputChange}
                                 required
                              />
                           </div>
                        </div>
                     )}

                     {currentStep === 2 && (
                        <div className="space-y-4">
                           <div className="h-[500px] overflow-y-auto pr-4 custom-scrollbar"> {/* Add this wrapper div with custom-scrollbar class */}
                              <UploadCard
                                 label="Letter Request"
                                 documentLabel="Upload Letter Request (1 original, 1 photocopy)"
                                 files={formData.files.letterRequest}
                                 onFileChange={(e) => handleFileChange(e, 'letterRequest')}
                                 onRemoveFile={(file) => removeFile('letterRequest', file)}
                              />
                              <UploadCard
                                 label="Title or Tax Declaration"
                                 documentLabel="Upload Title or Tax Declaration"
                                 files={formData.files.titleOrTaxDeclaration}
                                 onFileChange={(e) => handleFileChange(e, 'titleOrTaxDeclaration')}
                                 onRemoveFile={(file) => removeFile('titleOrTaxDeclaration', file)}
                              />
                              <UploadCard
                                 label="DAR Certification"
                                 documentLabel={<>Upload DAR Certification <strong>(if the Title is Certificate of Land Ownership Award)</strong></>}
                                 files={formData.files.darCertification}
                                 onFileChange={(e) => handleFileChange(e, 'darCertification')}
                                 onRemoveFile={(file) => removeFile('darCertification', file)}
                              />
                              <UploadCard
                                 label="Special Power of Attorney"
                                 documentLabel={<>Upload Special Power of Attorney <strong>(if representative)</strong></>}
                                 files={formData.files.specialPowerOfAttorney}
                                 onFileChange={(e) => handleFileChange(e, 'specialPowerOfAttorney')}
                                 onRemoveFile={(file) => removeFile('specialPowerOfAttorney', file)}
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

export default PTPRForm;
