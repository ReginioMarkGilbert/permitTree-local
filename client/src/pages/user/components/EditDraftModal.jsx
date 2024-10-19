import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EditDraftModal = ({ isOpen, onClose, onSave, application }) => {
   const [formData, setFormData] = useState(application);

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
               <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="name" className="text-right">
                        Name
                     </Label>
                     <Input
                        id="name"
                        name="name"
                        className="col-span-3"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        required
                     />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="address" className="text-right">
                        Address
                     </Label>
                     <Input
                        id="address"
                        name="address"
                        className="col-span-3"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        required
                     />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="purpose" className="text-right">
                        Purpose
                     </Label>
                     <Textarea
                        id="purpose"
                        name="purpose"
                        className="col-span-3"
                        value={formData.purpose || ''}
                        onChange={handleInputChange}
                        required
                     />
                  </div>
                  {/* Add more fields as needed */}
               </div>
               <DialogFooter>
                  <Button type="submit">Save changes</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
};

export default EditDraftModal;
