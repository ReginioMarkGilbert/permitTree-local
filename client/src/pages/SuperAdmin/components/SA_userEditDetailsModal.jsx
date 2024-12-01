import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const SA_UserEditDetailsModal = ({ isOpen, onClose, user, onSave }) => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [formData, setFormData] = useState({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address: '',
   });

   useEffect(() => {
      if (user) {
         setFormData({
            username: user.username || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            company: user.company || '',
            address: user.address || '',
         });
      }
   }, [user]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
         const updatedData = Object.entries(formData).reduce((acc, [key, value]) => {
            if (value.trim() !== '') {
               acc[key] = value;
            }
            return acc;
         }, {});

         await onSave({
            ...updatedData,
            id: user.id
         });
         onClose();
      } catch (error) {
         console.error('Error updating user:', error);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-[600px] p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
               <DialogTitle className="text-xl font-semibold">Edit User Details</DialogTitle>
               <DialogDescription>
                  Make changes to the user's information below. Phone, company, and address are optional.
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="px-6 space-y-6">
                  <Card className="p-4">
                     <h3 className="text-sm font-medium text-muted-foreground mb-4">User Information</h3>
                     <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                 id="firstName"
                                 name="firstName"
                                 value={formData.firstName}
                                 onChange={handleChange}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                 id="lastName"
                                 name="lastName"
                                 value={formData.lastName}
                                 onChange={handleChange}
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="username">Username</Label>
                           <Input
                              id="username"
                              name="username"
                              value={formData.username}
                              readOnly
                              className="bg-muted"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="email">Email</Label>
                           <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                           />
                        </div>
                     </div>
                  </Card>

                  <Card className="p-4">
                     <h3 className="text-sm font-medium text-muted-foreground mb-4">Contact Information</h3>
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="phone">Phone Number</Label>
                           <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="company">Company</Label>
                           <Input
                              id="company"
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="address">Address</Label>
                           <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                           />
                        </div>
                     </div>
                  </Card>
               </div>

               <DialogFooter className="flex space-x-2 px-6 py-4">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={onClose}
                     disabled={isSubmitting}
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     disabled={isSubmitting}
                     className={cn(
                        "bg-green-600 text-white hover:bg-green-700",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                     )}
                  >
                     {isSubmitting ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Saving...
                        </>
                     ) : (
                        'Save Changes'
                     )}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
};

export default SA_UserEditDetailsModal;
