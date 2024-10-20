import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import COVEditForm from './permitForms/COVEditForm';
import CSAWEditForm from './permitForms/CSAWEditForm';
import '@/components/ui/styles/customScrollbar.css';
import { useUserApplications } from '../hooks/useUserApplications';

// Utility function to safely format date
const formatDate = (dateString) => {
   return new Date(dateString).toLocaleDateString('en-US', {
       year: 'numeric',
       month: '2-digit',
       day: '2-digit'
   });
};

const EditDraftModal = ({ isOpen, onClose, onSave, application }) => {
   const [formData, setFormData] = useState(application);
   const { fetchCOVPermit, fetchCSAWPermit } = useUserApplications();
   const [hasFetched, setHasFetched] = useState(false);

   const fetchPermitData = useCallback(async () => {
      if (!hasFetched) {
         try {
            let permitData;
            if (application.applicationType === 'Certificate of Verification') {
               permitData = await fetchCOVPermit(application.id);
            } else if (application.applicationType === 'Chainsaw Registration') {
               permitData = await fetchCSAWPermit(application.id);
            } else {
               permitData = application;
            }
            console.log('Permit data fetched:', permitData);
            setFormData(permitData);
            setHasFetched(true);
         } catch (error) {
            console.error('Error fetching permit data:', error);
         }
      }
   }, [application, fetchCOVPermit, fetchCSAWPermit, hasFetched]);

   useEffect(() => {
      if (isOpen) {
         fetchPermitData();
         setHasFetched(true); // stop fetching after first fetch
      } else {
         setHasFetched(false);
      }
   }, [isOpen, fetchPermitData]);

   // const handleInputChange = (e) => {
   //    const { name, value } = e.target;
   //    setFormData(prevData => ({
   //       ...prevData,
   //       // [name]: value
   //       [name]: name === 'dateOfAcquisition' ? new Date(value).toISOString() : value
   //    }));
   // };

   const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleCheckboxChange = (name, checked) => {
      setFormData(prevData => ({
         ...prevData,
         [name]: checked
      }));
   };

   const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result.split(',')[1]);
         reader.onerror = (error) => reject(error);
         reader.readAsDataURL(file);
      });
   };

   const handleFileChange = async (e, documentType) => {
      const file = e.target.files[0];
      if (file) {
         try {
            const content = await readFileAsBase64(file);
            setFormData(prevData => ({
               ...prevData,
               files: {
                  ...(prevData.files || {}),  // Use empty object if files is null or undefined
                  [documentType]: [
                     ...(prevData.files?.[documentType] || []),
                     {
                        filename: file.name,
                        contentType: file.type,
                        data: content
                     }
                  ]
               }
            }));
         } catch (error) {
            console.error('Error processing file:', error);
            // Handle the error (e.g., show a toast notification)
         }
      }
   };

   const removeFile = (documentType, index) => {
      setFormData(prevData => {
         const updatedFiles = { ...(prevData.files || {}) };
         if (updatedFiles[documentType]) {
            updatedFiles[documentType] = updatedFiles[documentType].filter((_, i) => i !== index);
            if (updatedFiles[documentType].length === 0) {
               updatedFiles[documentType] = [];  // Set to empty array instead of deleting
            }
         }
         return { ...prevData, files: updatedFiles };
      });
   };

   const removeAllFiles = (documentType) => {
      setFormData(prevData => {
         const updatedFiles = { ...prevData.files };
         delete updatedFiles[documentType];
         return { ...prevData, files: updatedFiles };
      });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Submitting updated formData:', formData);
      onSave(formData);
      onClose();
   };

   const renderFormByType = () => {
      switch (application.applicationType) {
         case 'Certificate of Verification':
            return <COVEditForm
               formData={formData}
               handleInputChange={handleInputChange}
               handleFileChange={handleFileChange}
               removeFile={removeFile}
            />;
         case 'Chainsaw Registration':
            return <CSAWEditForm
               formData={formData}
               handleInputChange={handleInputChange}
               handleFileChange={handleFileChange}
               removeFile={removeFile}
               handleCheckboxChange={handleCheckboxChange}
            />;
         // Add cases for other permit types
         default:
            return <p>Unsupported permit type: {application.applicationType}</p>;
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
               <DialogTitle>Edit Draft Application</DialogTitle>
               <DialogDescription>
                  Edit the details of this draft application.
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto custom-scrollbar">
               <div>
                  {renderFormByType()}
               </div>
            </form>
            <DialogFooter className="mt-4">
               <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
               <Button type="submit" onClick={handleSubmit}>Save changes</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default EditDraftModal;
