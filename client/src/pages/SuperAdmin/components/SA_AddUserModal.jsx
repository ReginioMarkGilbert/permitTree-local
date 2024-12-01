import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const SA_AddUserModal = ({ isOpen, onClose, onAddUser }) => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [newUser, setNewUser] = useState({
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      email: '',
      role: '',
      userType: ''
   });
   const [showPassword, setShowPassword] = useState(false);

   useEffect(() => {
      if (newUser.firstName && newUser.lastName) {
         const generatedUsername = `${newUser.firstName.toLowerCase()}_${newUser.lastName.toLowerCase()}`.replace(/\s+/g, '');
         setNewUser(prev => ({ ...prev, username: generatedUsername }));
      }
   }, [newUser.firstName, newUser.lastName]);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewUser((prev) => ({ ...prev, [name]: value }));
   };

   const handleSelectChange = (value) => {
      const userType = value === 'user' ? 'Client' : 'Personnel';
      setNewUser((prev) => ({
         ...prev,
         role: value,
         userType: userType
      }));
   };

   const handleRoleChange = (value) => {
      const userType = value === 'user' ? 'Client' : 'Personnel';
      setNewUser((prev) => ({
         ...prev,
         role: value,
         userType: userType
      }));
   };

   const handleClose = () => {
      setNewUser({
         firstName: '',
         lastName: '',
         username: '',
         password: '',
         email: '',
         role: '',
         userType: ''
      });
      setShowPassword(false);
      onClose();
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
         await onAddUser(newUser);
         handleClose();
      } catch (error) {
         console.error('Error adding user:', error);
      } finally {
         setIsSubmitting(false);
      }
   };

   const roleOptions = [
      { value: 'user', label: 'User (Client)' },
      { value: 'Chief_RPS', label: 'Chief RPS (Personnel)' },
      { value: 'superadmin', label: 'Super Admin (Personnel)' },
      { value: 'Technical_Staff', label: 'Technical Staff (Personnel)' },
      { value: 'Chief_TSD', label: 'Chief TSD (Personnel)' },
      { value: 'Recieving_Clerk', label: 'Receiving Clerk (Personnel)' },
      { value: 'Releasing_Clerk', label: 'Releasing Clerk (Personnel)' },
      { value: 'Accountant', label: 'Accountant (Personnel)' },
      { value: 'Bill_Collector', label: 'Bill Collector (Personnel)' },
      { value: 'PENR_CENR_Officer', label: 'PENR/CENR Officer (Personnel)' }
   ];

   // Add browser detection
   const isChrome = React.useMemo(() => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isBrave = navigator.brave !== undefined;
      return userAgent.includes('chrome') && !userAgent.includes('edg') && !isBrave;
   }, []);

   const SelectComponent = () => {
      if (isChrome) {
         return (
            <div className="space-y-2">
               <Label htmlFor="role">Role</Label>
               <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  required
               >
                  <option value="" disabled>Select a role</option>
                  {roleOptions.map(option => (
                     <option key={option.value} value={option.value}>
                        {option.label}
                     </option>
                  ))}
               </select>
            </div>
         );
      }

      return (
         <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
               id="role"
               name="role"
               value={newUser.role}
               onValueChange={handleRoleChange}
            >
               <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
               </SelectTrigger>
               <SelectContent>
                  {roleOptions.map(option => (
                     <SelectItem key={option.value} value={option.value}>
                        {option.label}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>
      );
   };

   return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
         <DialogContent className="max-w-[600px] p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
               <DialogTitle className="text-xl font-semibold">Add New User</DialogTitle>
               <DialogDescription>
                  Fill in the information below to create a new user account
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="px-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                           id="firstName"
                           name="firstName"
                           value={newUser.firstName}
                           onChange={handleInputChange}
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                           id="lastName"
                           name="lastName"
                           value={newUser.lastName}
                           onChange={handleInputChange}
                           required
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="username">Username</Label>
                     <Input
                        id="username"
                        name="username"
                        value={newUser.username}
                        onChange={handleInputChange}
                        required
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="(Optional)"
                        value={newUser.email}
                        onChange={handleInputChange}
                     // required
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="password">Password</Label>
                     <div className="relative">
                        <Input
                           id="password"
                           name="password"
                           type={showPassword ? "text" : "password"}
                           value={newUser.password}
                           onChange={handleInputChange}
                           required
                           className="pr-10"
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                           {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                           ) : (
                              <Eye className="h-4 w-4" />
                           )}
                        </button>
                     </div>
                  </div>

                  <SelectComponent />
               </div>

               <DialogFooter className="flex space-x-2 px-6 py-4 border-t">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={handleClose}
                     disabled={isSubmitting}
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     disabled={isSubmitting}
                     className={cn(
                        "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                     )}
                  >
                     {isSubmitting ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Adding...
                        </>
                     ) : (
                        'Add User'
                     )}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
};

export default SA_AddUserModal;
