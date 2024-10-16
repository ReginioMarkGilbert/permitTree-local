import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/RadioGroup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../../components/ui/Modal';
import '../../../../components/ui/styles/CSAWFormScrollbar.css';
import { CheckboxItem, UploadCard, CustomSelect, CustomDatePicker, formatLabel, formatReviewValue } from './CSAWFormUtils';

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
         isPLTPRHolder: false,
         isWPPHolder: false,
      };
   });
   const [modalOpen, setModalOpen] = useState(false);
   const [modalContent, setModalContent] = useState({ title: '', message: '' });
   const [customStore, setCustomStore] = useState('');

   const chainsawStores = [
      { value: "Green Chainsaw Co.", label: "Green Chainsaw Co." },
      { value: "Forest Tools Inc.", label: "Forest Tools Inc." },
      { value: "EcoSaw Supplies", label: "EcoSaw Supplies" },
      { value: "Timber Tech Equipment", label: "Timber Tech Equipment" },
      { value: "Woodland Machinery", label: "Woodland Machinery" },
      { value: "other", label: "Other (not listed)" }
   ];

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
      if (currentStep === 0 && !formData.registrationType) {
         toast.error("Please select a registration type");
         return;
      }
      if (currentStep === 1) {
         if (formData.chainsawStore === "other" && !customStore) {
            toast.error("Please enter the name of the chainsaw store.");
            return;
         }
         // Update formData with custom store if "other" is selected
         if (formData.chainsawStore === "other") {
            setFormData(prev => ({ ...prev, chainsawStore: customStore }));
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
         const token = localStorage.getItem('token');
         const currentDate = new Date();
         const formDataToSend = new FormData();

         // Append all form fields
         Object.keys(formData).forEach(key => {
            if (key === 'files') {
               Object.keys(formData[key]).forEach(docType => {
                  formData[key][docType].forEach(file => {
                     formDataToSend.append(`${docType}[]`, file);
                  });
               });
            } else if (key !== 'status' && key !== 'dateOfSubmission') {
               formDataToSend.append(key, formData[key]);
            }
         });
         formDataToSend.append('dateOfSubmission', currentDate.toISOString());
         formDataToSend.append('status', 'Draft');

         const response = await axios.post('http://localhost:3000/api/csaw_saveDraft', formDataToSend, {
            headers: {
               'Content-Type': 'multipart/form-data',
               'Authorization': token
            }
         });

         setModalContent({
            title: 'Draft saved successfully!',
            message: 'Do you want to view your applications?'
         });
         setModalOpen(true);
      } catch (error) {
         console.error('Error saving draft:', error);
         toast.error("Error saving draft");
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const token = localStorage.getItem('token');
         if (!token) {
            toast.error("No authentication token found. Please log in.");
            return;
         }

         const currentDate = new Date();
         const formDataToSend = new FormData();

         // Append non-file fields
         Object.keys(formData).forEach(key => {
            if (key !== 'files') {
               formDataToSend.append(key, formData[key]);
            }
         });

         // Append files
         Object.keys(formData.files).forEach(fileType => {
            formData.files[fileType].forEach(file => {
               formDataToSend.append(fileType, file);
            });
         });

         formDataToSend.append('dateOfSubmission', currentDate.toISOString());
         formDataToSend.append('status', 'Submitted');

         // Log the form data
         for (let pair of formDataToSend.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
         }

         const response = await axios.post('http://localhost:3000/api/csaw_createApplication', formDataToSend, {
            headers: {
               'Content-Type': 'multipart/form-data',
               'Authorization': token
            }
         });

         // Handle successful submission
         console.log('Application submitted:', response.data);
         setModalContent({
            title: 'Application submitted successfully!',
            message: 'Do you want to view your application?'
         });
         setModalOpen(true);

         // If submission is successful, clear localStorage
         localStorage.removeItem('csawFormStep');
         localStorage.removeItem('csawFormData');
      } catch (error) {
         console.error('Error submitting application:', error);
         toast.error(`Error submitting application: ${error.message}`);
      }
   };

   const handleCheckboxChange = (e) => {
      const { name, checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: checked }));
   };

   const handleDateChange = (date) => {
      setFormData(prev => ({ ...prev, dateOfAcquisition: date }));
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

   return (
      <div className="min-h-screen bg-green-50 flex flex-col justify-between pt-[83px]">
         <div className="container mx-auto px-4 flex-grow">
            <h1 className="text-3xl font-[700] text-green-800 mb-6 text-center">Chainsaw Registration Application</h1>
            <Card className="max-w-2xl mx-auto shadow-lg">
               <CardHeader>
                  <CardTitle>{steps[currentStep].title}</CardTitle>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit}>
                     {currentStep === 0 && (
                        <div className="space-y-6 pb-4">
                           <RadioGroup
                              onValueChange={(value) => handleSelectChange('registrationType', value)}
                              value={formData.registrationType}
                           >
                              <div className="flex items-center space-x-2 pt-8">
                                 <RadioGroupItem value="New" id="new" className="w-12 h-12" />
                                 <Label htmlFor="new" className="text-lg font-semibold">New Registration</Label>
                              </div>
                              <div className="flex items-center space-x-2 pt-1">
                                 <RadioGroupItem value="Renewal" id="renewal" className="w-12 h-12" />
                                 <Label htmlFor="renewal" className="text-lg font-semibold">Renewal</Label>
                              </div>
                           </RadioGroup>
                        </div>
                     )}

                     {currentStep === 1 && (
                        <div className="space-y-4 pt-2">
                           <p className="text-sm text-gray-700 mb-3 font-semibold">
                              Please select the store where you purchased your chainsaw. If your store is not listed, please enter it manually.
                           </p>
                           <CustomSelect
                              value={formData.chainsawStore}
                              onChange={(value) => handleSelectChange('chainsawStore', value)}
                              options={chainsawStores}
                           />
                           {formData.chainsawStore === "other" && (
                              <div className="mt-4">
                                 <Label htmlFor="customStore">Enter Chainsaw Store Name</Label>
                                 <Input
                                    id="customStore"
                                    name="customStore"
                                    value={customStore}
                                    onChange={(e) => setCustomStore(e.target.value)}
                                    placeholder="Enter the name of the store"
                                    required
                                 />
                              </div>
                           )}
                        </div>
                     )}

                     {currentStep === 2 && (
                        <div className="space-y-4">
                           <p className="text-sm text-gray-700 mb-4 font-semibold">
                              Please check the boxes that apply to you. In the next step, you will be required to upload the corresponding documents.
                           </p>
                           <div className="space-y-2">
                              <CheckboxItem
                                 id="isOwner"
                                 label="Are you the owner of the Chainsaw?"
                                 checked={formData.isOwner}
                                 onChange={handleCheckboxChange}
                              />
                              <CheckboxItem
                                 id="isTenureHolder"
                                 label="Are you a Tenure holder?"
                                 checked={formData.isTenureHolder}
                                 onChange={handleCheckboxChange}
                              />
                              <CheckboxItem
                                 id="isBusinessOwner"
                                 label="Are you a business owner?"
                                 checked={formData.isBusinessOwner}
                                 onChange={handleCheckboxChange}
                              />
                              <CheckboxItem
                                 id="isPLTPRHolder"
                                 label="Are you a Private Land Tree Plantation Registration (PLTPR) holder?"
                                 checked={formData.isPLTPRHolder}
                                 onChange={handleCheckboxChange}
                              />
                              <CheckboxItem
                                 id="isWPPHolder"
                                 label="Are you a Licensed Wood Processor/Wood Processing Plant (WPP) holder?"
                                 checked={formData.isWPPHolder}
                                 onChange={handleCheckboxChange}
                              />
                           </div>
                        </div>
                     )}

                     {currentStep === 3 && (
                        <div className="step-3-container">
                           <p className="text-sm text-gray-700 mb-4 font-semibold">
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
                              {formData.isPLTPRHolder && (
                                 <UploadCard
                                    label="Certificate of Registration"
                                    documentLabel="Upload Certificate of Registration for Private Land Tree Plantation Registration (PLTPR)"
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
                           <div className="space-y-5 h-[600px]">
                              <div>
                                 <h3 className="text-lg font-semibold mb-1 text-green-700">Owner Details</h3>
                                 <div className="space-y-2">
                                    <div className="space-y-2">
                                       <Label htmlFor="ownerName">Name</Label>
                                       <Input
                                          id="ownerName"
                                          name="ownerName"
                                          value={formData.ownerName}
                                          onChange={handleInputChange}
                                          placeholder="Full Name"
                                          required
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <Label htmlFor="address">Address</Label>
                                       <Input
                                          id="address"
                                          name="address"
                                          value={formData.address}
                                          onChange={handleInputChange}
                                          placeholder="Barangay, Bayan, Probinsya"
                                          required
                                          autoComplete="street-address"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <Label htmlFor="phone">Phone Number</Label>
                                       <Input
                                          id="phone"
                                          name="phone"
                                          value={formData.phone}
                                          onChange={handleInputChange}
                                          placeholder="e.g. 09123456789"
                                          required
                                          autoComplete="tel"
                                       />
                                    </div>
                                 </div>
                              </div>
                              <div>
                                 <h3 className="text-lg font-semibold mb-2 text-green-700">Chainsaw Details</h3>
                                 <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <Label htmlFor="brand">Brand</Label>
                                          <Input
                                             id="brand"
                                             name="brand"
                                             value={formData.brand}
                                             onChange={handleInputChange}
                                             placeholder="Enter Brand"
                                             required
                                          />
                                       </div>
                                       <div>
                                          <Label htmlFor="model">Model</Label>
                                          <Input
                                             id="model"
                                             name="model"
                                             value={formData.model}
                                             onChange={handleInputChange}
                                             placeholder="Enter Model"
                                             required
                                          />
                                       </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <Label htmlFor="serialNumber">Serial No.</Label>
                                          <Input
                                             id="serialNumber"
                                             name="serialNumber"
                                             value={formData.serialNumber}
                                             onChange={handleInputChange}
                                             placeholder="Enter Serial Number"
                                             required
                                          />
                                       </div>
                                       <div>
                                          <Label htmlFor="dateOfAcquisition">Date of Acquisition</Label>
                                          <CustomDatePicker
                                             selectedDate={formData.dateOfAcquisition}
                                             onChange={handleDateChange}
                                          />
                                       </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <Label htmlFor="powerOutput">Power Output (kW/bhp)</Label>
                                          <Input
                                             id="powerOutput"
                                             name="powerOutput"
                                             value={formData.powerOutput}
                                             onChange={handleInputChange}
                                             placeholder="e.g. 5 kW or 6.7 bhp"
                                             required
                                          />
                                       </div>
                                       <div>
                                          <Label htmlFor="maxLengthGuidebar">Maximum Length of Guidebar (Inches)</Label>
                                          <Input
                                             id="maxLengthGuidebar"
                                             name="maxLengthGuidebar"
                                             value={formData.maxLengthGuidebar}
                                             onChange={handleInputChange}
                                             placeholder="e.g. 20 inches"
                                             required
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
                        <div className="space-y-6 h-[630px] flex flex-col">
                           <div className="review-step-container csaw-form-scrollbar flex-grow overflow-auto">
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
         <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
         />
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

export default ChainsawRegistrationForm;
