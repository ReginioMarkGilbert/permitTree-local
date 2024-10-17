// PLTP - Public Land Timber Permit
// ISSUANCE OF TREE CUTTING PERMIT FOR PLANTED TREES AND NATURALLY GROWING TREES FOUND WITHIN PUBLIC PLACES (PLAZA, PUBLIC PARKS, SCHOOL PREMISES OR POLITICAL SUBDIVISIONS) FOR PURPOSES OF PUBLIC SAFETY
// This Permit serves as proof of authorization for the removal/cutting of trees in public places (Plaza, Public Parks, School Premises or Political Subdivisions for purposes of public safety).

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
        applicationLetter {
          filename
          contentType
        }
        lguEndorsement {
          filename
          contentType
        }
        homeownersResolution {
          filename
          contentType
        }
        ptaResolution {
          filename
          contentType
        }
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
         applicationType: 'Public Land Timber Permit',
         name: '',
         address: '',
         contactNumber: '',
         treeType: '',
         treeStatus: '',
         landType: '',
         posingDanger: false,
         forPersonalUse: false,
         purpose: '',
         files: {
            applicationLetter: [],
            lguEndorsement: [],
            homeownersResolution: [],
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
         const currentDate = new Date().toISOString();
         const input = {
            ...formData,
            dateOfSubmission: currentDate,
            status: 'Draft',
            treeType: formData.treeType.join(', '), // Join array into a string
            treeStatus: formData.treeStatus.join(', '), // Join array into a string
            landType: formData.landType.join(', '), // Join array into a string
            files: Object.fromEntries(
               Object.entries(formData.files).map(([key, files]) => [
                  key,
                  files.map(file => file.name)
               ])
            ),
         };

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
         const currentDate = new Date().toISOString();
         const input = {
            ...formData,
            dateOfSubmission: currentDate,
            status: 'Submitted',
            files: await Promise.all(
               Object.entries(formData.files).map(async ([key, files]) => {
                  const uploadedFiles = await Promise.all(files.map(async (file) => {
                     const reader = new FileReader();
                     return new Promise((resolve) => {
                        reader.onload = () => resolve({
                           filename: file.name,
                           contentType: file.type,
                           data: reader.result.split(',')[1] // base64 data
                        });
                        reader.readAsDataURL(file);
                     });
                  }));
                  return [key, uploadedFiles];
               })
            ).then(Object.fromEntries),
         };

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
            <h1 className="text-3xl font-[700] text-green-800 mb-6 text-center">Public Land Timber Permit Application</h1>
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
                                       checked={formData.treeType.includes('Planted')}
                                       onCheckedChange={(checked) => {
                                          const newTreeType = checked
                                             ? [...formData.treeType, 'Planted']
                                             : formData.treeType.filter(type => type !== 'Planted');
                                          setFormData(prev => ({ ...prev, treeType: newTreeType }));
                                       }}
                                    />
                                    <Label htmlFor="plantedTrees" className="text-sm font-medium">Planted Trees</Label>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                       id="naturallyGrown"
                                       checked={formData.treeType.includes('Naturally Grown')}
                                       onCheckedChange={(checked) => {
                                          const newTreeType = checked
                                             ? [...formData.treeType, 'Naturally Grown']
                                             : formData.treeType.filter(type => type !== 'Naturally Grown');
                                          setFormData(prev => ({ ...prev, treeType: newTreeType }));
                                       }}
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
                                       checked={formData.treeStatus.includes('Standing')}
                                       onCheckedChange={(checked) => {
                                          const newTreeStatus = checked
                                             ? [...formData.treeStatus, 'Standing']
                                             : formData.treeStatus.filter(status => status !== 'Standing');
                                          setFormData(prev => ({ ...prev, treeStatus: newTreeStatus }));
                                       }}
                                    />
                                    <Label htmlFor="standing" className="text-sm font-medium">Standing</Label>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                       id="blownDown"
                                       checked={formData.treeStatus.includes('Blown Down')}
                                       onCheckedChange={(checked) => {
                                          const newTreeStatus = checked
                                             ? [...formData.treeStatus, 'Blown Down']
                                             : formData.treeStatus.filter(status => status !== 'Blown Down');
                                          setFormData(prev => ({ ...prev, treeStatus: newTreeStatus }));
                                       }}
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
                                       id="privateLand"
                                       checked={formData.landType.includes('Private Land')}
                                       onCheckedChange={(checked) => {
                                          const newLandType = checked
                                             ? [...formData.landType, 'Private Land']
                                             : formData.landType.filter(type => type !== 'Private Land');
                                          setFormData(prev => ({ ...prev, landType: newLandType }));
                                       }}
                                    />
                                    <Label htmlFor="privateLand" className="text-sm font-medium">Within Private Land</Label>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox
                                       id="tenuredForestLand"
                                       checked={formData.landType.includes('Tenured Forest Land')}
                                       onCheckedChange={(checked) => {
                                          const newLandType = checked
                                             ? [...formData.landType, 'Tenured Forest Land']
                                             : formData.landType.filter(type => type !== 'Tenured Forest Land');
                                          setFormData(prev => ({ ...prev, landType: newLandType }));
                                       }}
                                    />
                                    <Label htmlFor="tenuredForestLand" className="text-sm font-medium">Within Tenured Forest Land</Label>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <Label className="text-lg font-semibold text-green-700">Additional Characteristics</Label>
                              <div className="flex items-center space-x-2 mt-2">
                                 <Checkbox
                                    id="posingDanger"
                                    checked={formData.posingDanger}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, posingDanger: checked }))}
                                 />
                                 <Label htmlFor="posingDanger" className="text-sm font-medium">Posing Danger</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <Checkbox
                                    id="forPersonalUse"
                                    checked={formData.forPersonalUse}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, forPersonalUse: checked }))}
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
                                 label="Application Letter"
                                 documentLabel="Upload Application Letter (1 original)"
                                 files={formData.files.applicationLetter}
                                 onFileChange={(e) => handleFileChange(e, 'applicationLetter')}
                                 onRemoveFile={(file) => removeFile('applicationLetter', file)}
                              />
                              <UploadCard
                                 label="LGU Endorsement"
                                 documentLabel="Upload LGU Endorsement/Certification of No Objection/Resolution (1 original)"
                                 files={formData.files.lguEndorsement}
                                 onFileChange={(e) => handleFileChange(e, 'lguEndorsement')}
                                 onRemoveFile={(file) => removeFile('lguEndorsement', file)}
                              />
                              <UploadCard
                                 label="Homeowner's Resolution"
                                 documentLabel={<>Upload Homeowner's Resolution (1 original) <strong>(If within Subdivision)</strong></>}
                                 files={formData.files.homeownersResolution}
                                 onFileChange={(e) => handleFileChange(e, 'homeownersResolution')}
                                 onRemoveFile={(file) => removeFile('homeownersResolution', file)}
                              />
                              <UploadCard
                                 label="PTA Resolution"
                                 documentLabel={<>Upload PTA Resolution or Resolution from any organize group of No Objection and Reason for Cutting (1 original) <strong>(If School/Organization)</strong></>}
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
