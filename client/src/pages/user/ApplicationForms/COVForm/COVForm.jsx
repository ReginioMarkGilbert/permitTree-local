// COV - Certificate of Verification
// CERTIFICATE OF VERIFICATION (COV) FOR THE TRANSPORT OF PLANTED TREES WITHIN PRIVATE LAND, NON-TIMBER FOREST PRODUCTS EXCEPT RATTAN AND BAMBOO
// COV is a document to be presented when transporting planted trees within private lands not registered under the Private Tree Plantation Registration and/or non-premium trees, non-timber forest products (except rattan and bamboo)

import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../../components/ui/Modal';
import { UploadCard } from '../CSAWForm/CSAWFormUtils';
import { gql, useMutation } from '@apollo/client';
import { formatLabel, formatReviewValue } from '../CSAWForm/CSAWFormUtils';
import '../../../../components/ui/styles/customScrollBar.css';  // Add this import
import { Textarea } from '../../../../components/ui/Textarea';  // Add this import at the top of the file

const CREATE_COV_PERMIT = gql`
  mutation CreateCOVPermit($input: COVPermitInput!) {
    createCOVPermit(input: $input) {
      id
      status
      # Add other fields you want to receive back
    }
  }
`;

const SAVE_COV_PERMIT_DRAFT = gql`
  mutation SaveCOVPermitDraft($input: COVPermitInput!) {
    saveCOVPermitDraft(input: $input) {
      id
      status
      # Add other fields you want to receive back
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
      try {
         const currentDate = new Date().toISOString();
         const input = {
            ...formData,
            dateOfSubmission: currentDate,
            status: 'Draft',
            files: Object.fromEntries(
               Object.entries(formData.files).map(([key, files]) => [
                  key,
                  files.map(file => file.name)
               ])
            ),
         };

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

            // Clear localStorage
            localStorage.removeItem('covFormStep');
            localStorage.removeItem('covFormData');
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
            files: Object.fromEntries(
               Object.entries(formData.files).map(([key, files]) => [
                  key,
                  files.map(file => file.name)
               ])
            ),
         };

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

            // Clear localStorage
            localStorage.removeItem('covFormStep');
            localStorage.removeItem('covFormData');
         }
      } catch (error) {
         console.error('Error submitting application:', error);
         toast.error("Error submitting application: " + error.message);
      }
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
      <div className="min-h-screen bg-green-50 flex flex-col justify-between pt-[83px] ">
         <div className="container mx-auto px-4 flex-grow">
            <h1 className="text-3xl font-[700] text-green-800 mb-6 text-center">Certificate of Verification Application</h1>
            <Card className="max-w-2xl mx-auto shadow-lg">
               <CardHeader>
                  <CardTitle>{steps[currentStep].title}</CardTitle>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit}>
                     {currentStep === 0 && (
                        <div className="space-y-4">
                           <div className="space-y-5 h-[600px] overflow-y-auto pr-4 custom-scrollbar"> {/* Add custom-scrollbar class here */}
                              <div>
                                 <div className="pl-2 space-y-2">
                                    <div>
                                       <Label htmlFor="name">Name</Label>
                                       <Input id="name"
                                          name="name"
                                          value={formData.name}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Full Name"
                                       />
                                    </div>
                                    <div>
                                       <Label htmlFor="address">Address</Label>
                                       <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required placeholder="Barangay, Bayan, Probinsya" />
                                    </div>
                                    <div>
                                       <Label htmlFor="cellphone">Cellphone</Label>
                                       <Input id="cellphone" name="cellphone" value={formData.cellphone} onChange={handleInputChange} required placeholder="e.g. 09123456789" />
                                    </div>
                                    <div>
                                       <Label htmlFor="purpose">Purpose</Label>
                                       <Textarea
                                          id="purpose"
                                          name="purpose"
                                          value={formData.purpose}
                                          onChange={handleInputChange}
                                          required
                                          placeholder="Describe the purpose of transport"
                                          className="min-h-[100px]"
                                       />
                                    </div>
                                 </div>
                              </div>
                              <div>
                                 <h3 className="pl-2 text-lg font-semibold mb-1 text-green-700">Driver Information</h3>
                                 <div className="pl-2 space-y-2">
                                    <div>
                                       <Label htmlFor="driverName">Driver Name</Label>
                                       <Input id="driverName" name="driverName" value={formData.driverName} onChange={handleInputChange} required placeholder="Full Name of Driver" />
                                    </div>
                                    <div>
                                       <Label htmlFor="driverLicenseNumber">Driver License Number</Label>
                                       <Input id="driverLicenseNumber" name="driverLicenseNumber" value={formData.driverLicenseNumber} onChange={handleInputChange} required placeholder="Enter License Number" />
                                    </div>
                                    <div>
                                       <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
                                       <Input id="vehiclePlateNumber" name="vehiclePlateNumber" value={formData.vehiclePlateNumber} onChange={handleInputChange} required placeholder="Enter Plate Number" />
                                    </div>
                                 </div>
                              </div>
                              <div>
                                 <h3 className="pl-2 text-lg font-semibold mb-1 text-green-700">Transport Details</h3>
                                 <div className="pl-2 space-y-2">
                                    <div>
                                       <Label htmlFor="originAddress">Origin Address</Label>
                                       <Input id="originAddress" name="originAddress" value={formData.originAddress} onChange={handleInputChange} required placeholder="Enter Origin Address" />
                                    </div>
                                    <div>
                                       <Label htmlFor="destinationAddress">Destination Address</Label>
                                       <Input id="destinationAddress" name="destinationAddress" value={formData.destinationAddress} onChange={handleInputChange} required placeholder="Enter Destination Address" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {currentStep === 1 && (
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
                              documentLabel="Upload Forest Certification"
                              files={formData.files.forestCertification}
                              onFileChange={(e) => handleFileChange(e, 'forestCertification')}
                              onRemoveFile={(file) => removeFile('forestCertification', file)}
                           />
                        </div>
                     )}

                     {currentStep === 2 && (
                        <div className="space-y-4">
                           <UploadCard
                              label="OR/CR"
                              documentLabel="Upload OR/CR"
                              files={formData.files.orCr}
                              onFileChange={(e) => handleFileChange(e, 'orCr')}
                              onRemoveFile={(file) => removeFile('orCr', file)}
                           />
                           <UploadCard
                              label="Driver's License"
                              documentLabel="Upload Driver's License"
                              files={formData.files.driverLicense}
                              onFileChange={(e) => handleFileChange(e, 'driverLicense')}
                              onRemoveFile={(file) => removeFile('driverLicense', file)}
                           />
                           <UploadCard
                              label="Special Power of Attorney"
                              documentLabel="Upload Special Power of Attorney"
                              files={formData.files.specialPowerOfAttorney}
                              onFileChange={(e) => handleFileChange(e, 'specialPowerOfAttorney')}
                              onRemoveFile={(file) => removeFile('specialPowerOfAttorney', file)}
                           />
                        </div>
                     )}

                     {currentStep === 3 && (
                        <div className="space-y-6 h-[630px] flex flex-col">
                           <div className="review-step-container custom-scrollbar flex-grow overflow-auto"> {/* Add custom-scrollbar class here */}
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
            onHome={() => navigate('/')}
            onApplications={() => navigate('/applicationsStatus')}
         />
      </div>
   );
};

export default COVForm;
