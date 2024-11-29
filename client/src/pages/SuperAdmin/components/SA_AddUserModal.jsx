import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomSelect from "@/components/ui/custom-select";
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const SA_AddUserModal = ({ isOpen, onClose, onAddUser }) => {
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
   const [isChrome, setIsChrome] = useState(false);

   useEffect(() => {
      if (newUser.firstName && newUser.lastName) {
         const generatedUsername = `${newUser.firstName.toLowerCase()}_${newUser.lastName.toLowerCase()}`;
         setNewUser(prev => ({ ...prev, username: generatedUsername }));
      } else {
         setNewUser(prev => ({ ...prev, username: '' }));
      }
   }, [newUser.firstName, newUser.lastName]);

   useEffect(() => {
      // Check if browser is Chrome
      const isChromeBrowser = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      setIsChrome(isChromeBrowser);
   }, []);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewUser((prev) => ({ ...prev, [name]: value }));
   };

   const handleSelectChange = (name, value) => {
      const userType = value === 'user' ? 'Client' : 'Personnel';
      setNewUser((prev) => ({
         ...prev,
         [name]: value,
         userType: userType // Automatically set userType based on role
      }));
   };

   const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
   };

   const handleClose = () => {
      // Reset form data
      setNewUser({
         firstName: '',
         lastName: '',
         username: '',
         password: '',
         email: '',
         role: '',
         userType: ''
      });
      onClose();
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await onAddUser(newUser);
         handleClose(); // Use handleClose instead of onClose
      } catch (error) {
         console.error('Error adding user:', error);
      }
   };

   // Role options for CustomSelect
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

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Add New User</DialogTitle>
               <DialogDescription>
                  Add a new user to the system.
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
               <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="firstName" className="text-right">
                        First Name
                     </Label>
                     <Input
                        id="firstName"
                        name="firstName"
                        value={newUser.firstName}
                        onChange={handleInputChange}
                        className="col-span-3"
                     />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="lastName" className="text-right">
                        Last Name
                     </Label>
                     <Input
                        id="lastName"
                        name="lastName"
                        value={newUser.lastName}
                        onChange={handleInputChange}
                        className="col-span-3"
                     />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="username" className="text-right">
                        Username
                     </Label>
                     <Input
                        id="username"
                        name="username"
                        value={newUser.username}
                        readOnly
                        className="col-span-3"
                     />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="email" className="text-right">
                        Email
                     </Label>
                     <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        className="col-span-3"
                     />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="password" className="text-right">
                        Password
                     </Label>
                     <div className="col-span-3 relative">
                        <Input
                           id="password"
                           name="password"
                           type={showPassword ? "text" : "password"}
                           value={newUser.password}
                           onChange={handleInputChange}
                           className="pr-10"
                        />
                        <button
                           type="button"
                           onClick={togglePasswordVisibility}
                           className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                           {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                           ) : (
                              <Eye className="h-5 w-5" />
                           )}
                        </button>
                     </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="role" className="text-right">
                        Role
                     </Label>
                     <div className="col-span-3">
                        {isChrome ? (
                           <CustomSelect
                              options={roleOptions}
                              value={newUser.role}
                              onSelect={(value) => handleSelectChange('role', value)}
                              placeholder="Select role"
                           />
                        ) : (
                           <Select
                              onValueChange={(value) => handleSelectChange('role', value)}
                              value={newUser.role}
                           >
                              <SelectTrigger>
                                 <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                 {roleOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                       {option.label}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        )}
                     </div>
                  </div>
               </div>
               <DialogFooter>
                  <Button type="submit">Add User</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
};

export default SA_AddUserModal;
