import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import COVEditForm from './permitForms/COVEditForm';
// import CSAWEditForm from './permitForms/CSAWEditForm';

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

   const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
      onClose();
   };

   const renderFormByType = () => {
      switch (application.applicationType) {
         case 'Certificate of Verification':
            return <COVEditForm formData={formData} handleInputChange={handleInputChange} />;
         // case 'CSAW':
         //    return <CSAWEditForm formData={formData} handleInputChange={handleInputChange} />;
         // Add cases for other permit types
         default:
            return <p>Unsupported permit type: {application.applicationType}</p>;
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Edit Draft Application</DialogTitle>
               <DialogDescription>
                  Edit the details of this draft application.
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
               {renderFormByType()}
               <DialogFooter>
                  <Button type="submit">Save changes</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
};

export default EditDraftModal;
