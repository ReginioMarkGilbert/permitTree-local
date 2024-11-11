import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Camera, Trash2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ChangePasswordForm from './components/ChangePasswordForm';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription
} from "@/components/ui/dialog";

const GET_USER_DETAILS = gql`
  query GetUserDetails {
    getUserDetails {
      id
      firstName
      lastName
      email
      phone
      company
      address
      profilePicture {
        data
        contentType
      }
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      firstName
      lastName
      email
      phone
      company
      address
      profilePicture {
        data
        contentType
      }
    }
  }
`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default function UserProfilePage() {
   const [userInfo, setUserInfo] = useState({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      company: '',
   });
   const [initialUserInfo, setInitialUserInfo] = useState(null);
   const [profilePicture, setProfilePicture] = useState(null);
   const [showPhotoOptions, setShowPhotoOptions] = useState(false);
   const fileInputRef = useRef(null);
   const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const location = useLocation();
   const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

   const { loading, error, data, refetch } = useQuery(GET_USER_DETAILS);
   const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);

   useEffect(() => {
      if (data?.getUserDetails) {
         const { firstName, lastName, email, phone, address, company, profilePicture } = data.getUserDetails;
         const fetchedData = {
            fullName: `${firstName} ${lastName}`,
            email: email || '',
            phone: phone || '',
            address: address || '',
            company: company || '',
            profilePicture: profilePicture
               ? `data:${profilePicture.contentType};base64,${profilePicture.data}`
               : ''
         };
         setUserInfo(fetchedData);
         setInitialUserInfo(fetchedData);
      }
   }, [data]);

   const handleInputChange = (e) => {
      const { id, value } = e.target;
      if (id === 'fullName' && /[^a-zA-Z\s]/.test(value)) {
         toast.error('Full Name must only contain letters and spaces.');
         return;
      }
      setUserInfo(prev => ({ ...prev, [id]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (isEditing) {
         try {
            const [firstName, lastName] = userInfo.fullName.split(' ');
            const input = {
               firstName,
               lastName,
               email: userInfo.email,
               phone: userInfo.phone,
               company: userInfo.company,
               address: userInfo.address,
               removeProfilePicture,
            };

            if (profilePicture) {
               const reader = new FileReader();
               reader.onloadend = async () => {
                  input.profilePicture = {
                     data: reader.result.split(',')[1], // Base64 data
                     contentType: profilePicture.type
                  };

                  await updateProfile(input);
               };
               reader.readAsDataURL(profilePicture);
            } else {
               await updateProfile(input);
            }
         } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('Failed to update profile.');
         }
      }
      setIsEditing(!isEditing);
   };

   const updateProfile = async (input) => {
      try {
         const { data } = await updateUserProfile({
            variables: { input },
         });

         toast.success('Profile updated successfully!');
         setRemoveProfilePicture(false);
         refetch();
      } catch (err) {
         console.error('Error updating profile:', err);
         toast.error('Failed to update profile. File might be too large.');
      }
   };

   const handleCancel = () => {
      setUserInfo(initialUserInfo);
      setIsEditing(false);
   };

   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         if (file.size > MAX_FILE_SIZE) {
            toast.error('File size exceeds 10MB limit. Please choose a smaller file.');
            return;
         }
         setProfilePicture(file);
         const reader = new FileReader();
         reader.onloadend = () => {
            setUserInfo(prev => ({ ...prev, profilePicture: reader.result }));
         };
         reader.readAsDataURL(file);
      }
   };

   const handleProfilePictureClick = () => {
      if (isEditing) {
         setShowPhotoOptions(true);
      }
   };

   const handleRemovePhoto = () => {
      setProfilePicture(null);
      setUserInfo(prev => ({ ...prev, profilePicture: null }));
      setShowPhotoOptions(false);
      setRemoveProfilePicture(true);
   };

   const inputClasses = `w-full rounded-md focus:ring-green-500 focus:border-green-500 h-12 pl-3 ${isEditing ? 'bg-gray-100 border-gray-300' : 'bg-white border-transparent'
      }`;

   if (loading) {
      return (
         <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
         </div>
      );
   }

   return (
      <div className="bg-green-50 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
               <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
                  <Button
                     onClick={() => setIsEditing(!isEditing)}
                     variant={isEditing ? "destructive" : "outline"}
                  >
                     {isEditing ? (
                        "Cancel"
                     ) : (
                        <>
                           <Pencil className="h-4 w-4 mr-2" />
                           Edit Profile
                        </>
                     )}
                  </Button>
               </div>

               {/* Profile Picture Section */}
               <div className="flex items-center space-x-6">
                  <div className="relative">
                     <div
                        className={`h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-2xl text-gray-600 border-2 ${isEditing ? 'border-green-500 cursor-pointer' : 'border-transparent'}`}
                        onClick={() => isEditing && setShowPhotoOptions(true)}
                     >
                        {userInfo.profilePicture ? (
                           <img
                              src={userInfo.profilePicture}
                              alt="Profile"
                              className="h-full w-full object-cover"
                           />
                        ) : (
                           <span>{userInfo.fullName.split(' ').map(n => n[0]).join('')}</span>
                        )}
                     </div>
                     {isEditing && (
                        <div className="absolute bottom-0 right-0">
                           <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 rounded-full shadow-lg"
                              onClick={() => fileInputRef.current?.click()}
                           >
                              <Camera className="h-4 w-4" />
                           </Button>
                        </div>
                     )}
                  </div>
                  <div>
                     <h2 className="text-xl font-semibold">{userInfo.fullName}</h2>
                     <p className="text-sm text-gray-500">Permit Applicant</p>
                  </div>
               </div>
            </div>

            {/* Account Overview Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
               <h3 className="text-lg font-medium mb-4">Account Overview</h3>
               <Separator className="mb-4" />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                     <h4 className="text-sm font-medium text-gray-500">Total Applications</h4>
                     <p className="text-2xl font-semibold mt-1">12</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                     <h4 className="text-sm font-medium text-gray-500">Active Permits</h4>
                     <p className="text-2xl font-semibold mt-1">3</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                     <h4 className="text-sm font-medium text-gray-500">Pending Payments</h4>
                     <p className="text-2xl font-semibold mt-1">2</p>
                  </div>
               </div>
            </div>

            {/* Personal Information Form */}
            <div className="bg-white rounded-lg shadow-sm p-8">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                     <Separator className="mb-4" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="fullName">Full Name</Label>
                           <Input
                              id="fullName"
                              value={userInfo.fullName}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? 'bg-gray-50' : ''}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="email">Email</Label>
                           <Input
                              id="email"
                              type="email"
                              value={userInfo.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? 'bg-gray-50' : ''}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="phone">Phone</Label>
                           <Input
                              id="phone"
                              value={userInfo.phone}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? 'bg-gray-50' : ''}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="company">Company</Label>
                           <Input
                              id="company"
                              value={userInfo.company}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? 'bg-gray-50' : ''}
                           />
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-lg font-medium mb-4">Address</h3>
                     <Separator className="mb-4" />
                     <div className="space-y-2">
                        <Label htmlFor="address">Complete Address</Label>
                        <Input
                           id="address"
                           value={userInfo.address}
                           onChange={handleInputChange}
                           disabled={!isEditing}
                           className={!isEditing ? 'bg-gray-50' : ''}
                        />
                     </div>
                  </div>

                  {/* Account Security Section */}
                  <div>
                     <h3 className="text-lg font-medium mb-4">Account Security</h3>
                     <Separator className="mb-4" />
                     <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="font-medium">Password</h4>
                              <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                           </div>
                           <Button variant="outline" size="sm" onClick={() => setIsChangePasswordOpen(true)}>
                              Change Password
                           </Button>
                        </div>
                     </div>
                  </div>

                  {/* Account Activity Section */}
                  <div>
                     <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                     <Separator className="mb-4" />
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span>Last login</span>
                           </div>
                           <span className="text-gray-500">Today, 9:42 AM</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <span>Profile updated</span>
                           </div>
                           <span className="text-gray-500">Yesterday, 3:15 PM</span>
                        </div>
                     </div>
                  </div>

                  {isEditing && (
                     <div className="flex justify-end space-x-4">
                        <Button
                           type="button"
                           variant="outline"
                           onClick={handleCancel}
                        >
                           Cancel
                        </Button>
                        <Button
                           type="submit"
                           className="bg-green-600 hover:bg-green-700"
                           disabled={isLoading}
                        >
                           {isLoading ? (
                              <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Saving...
                              </>
                           ) : (
                              'Save Changes'
                           )}
                        </Button>
                     </div>
                  )}
               </form>

               <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!isEditing}
               />
            </div>

            {/* Change Password Dialog */}
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle>Change Password</DialogTitle>
                     <DialogDescription>
                        Make sure to remember your new password.
                     </DialogDescription>
                  </DialogHeader>
                  <ChangePasswordForm onClose={() => setIsChangePasswordOpen(false)} />
               </DialogContent>
            </Dialog>
         </div>
      </div>
   );
}
