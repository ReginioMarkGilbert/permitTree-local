import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import COVEditForm from './permitForms/COVEditForm';
// import CSAWEditForm from './permitForms/CSAWEditForm';
import '@/components/ui/styles/customScrollBar.css';

const EditDraftModal = ({ isOpen, onClose, onSave, application }) => {
   const [formData, setFormData] = useState(application);

   useEffect(() => {
      setFormData(application);
   }, [application]);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
         ...prevData,
         [name]: value
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
                  ...prevData.files,
                  [documentType]: [
                     ...(prevData.files[documentType] || []),
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
         const updatedFiles = { ...prevData.files };
         if (updatedFiles[documentType]) {
            updatedFiles[documentType] = updatedFiles[documentType].filter((_, i) => i !== index);
            if (updatedFiles[documentType].length === 0) {
               delete updatedFiles[documentType];
            }
         }
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
         // case 'CSAW':
         //    return <CSAWEditForm formData={formData} handleInputChange={handleInputChange} />;
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
