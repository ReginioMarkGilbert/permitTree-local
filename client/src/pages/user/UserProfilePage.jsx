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
import { formatDistanceToNow, format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

const GET_USER_DETAILS = gql`
  query GetUserDetails {
    getUserDetails {
      id
      username
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
      lastPasswordChange
      recentActivities {
        id
        type
        timestamp
        details
      }
      stats {
        totalApplications
        activePermits
        pendingPayments
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
      username: '',
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
   const [lastPasswordChange, setLastPasswordChange] = useState(null);
   const [activities, setActivities] = useState([]);
   const [userStats, setUserStats] = useState({
      totalApplications: 0,
      activePermits: 0,
      pendingPayments: 0
   });

   const { loading, error, data, refetch } = useQuery(GET_USER_DETAILS);
   const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);

   useEffect(() => {
      if (data?.getUserDetails) {
         const { firstName, lastName, username, email, phone, address, company, profilePicture, lastPasswordChange, recentActivities, stats } = data.getUserDetails;
         const fetchedData = {
            fullName: `${firstName} ${lastName}`,
            username: username || '',
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
         setLastPasswordChange(lastPasswordChange);
         setActivities(recentActivities || []);
         setUserStats(stats);
      }
   }, [data]);

   const handleInputChange = (e) => {
      const { id, value } = e.target;
      if (id === 'fullName' && /[^a-zA-Z\s]/.test(value)) {
         toast.error('Full Name must only contain letters and spaces.');
         return;
      }
      if (id === 'username' && /[^a-z0-9_]/.test(value)) {
         toast.error('Username must only contain lowercase letters, numbers, and underscores.');
         return;
      }
      setUserInfo(prev => ({ ...prev, [id]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isEditing) {
         setIsEditing(true);
         return;
      }

      setIsLoading(true);
      try {
         const nameParts = userInfo.fullName.trim().split(/\s+/);
         const lastName = nameParts.pop();
         const firstName = nameParts.join(' ');

         const input = {
            firstName,
            lastName,
            username: userInfo.username,
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
                  data: reader.result.split(',')[1],
                  contentType: profilePicture.type
               };

               await updateProfile(input);
            };
            reader.readAsDataURL(profilePicture);
         } else {
            await updateProfile(input);
         }

         setIsEditing(false);
      } catch (err) {
         console.error('Error updating profile:', err);
         toast.error('Failed to update profile.');
      } finally {
         setIsLoading(false);
      }
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
         throw err;
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

   const getPasswordChangeText = () => {
      if (!lastPasswordChange) return 'Never changed';
      try {
         return `Last changed ${formatDistanceToNow(new Date(lastPasswordChange))} ago`;
      } catch (error) {
         console.error('Error formatting date:', error);
         return 'Date unavailable';
      }
   };

   const getActivityIcon = (type) => {
      switch (type) {
         case 'LOGIN':
            return <div className="w-2 h-2 bg-green-500 rounded-full" />;
         case 'PROFILE_UPDATE':
            return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
         case 'PASSWORD_CHANGE':
            return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
         default:
            return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
      }
   };

   const getActivityText = (type) => {
      switch (type) {
         case 'LOGIN':
            return 'Last login';
         case 'PROFILE_UPDATE':
            return 'Profile updated';
         case 'PASSWORD_CHANGE':
            return 'Password changed';
         default:
            return 'Activity recorded';
      }
   };

   if (loading) {
      return (
         <div className="bg-green-50 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
               {/* Profile Header Skeleton */}
               <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                     <Skeleton className="h-8 w-48" />
                     <Skeleton className="h-10 w-32" />
                  </div>
                  <div className="flex items-center space-x-6">
                     <Skeleton className="h-24 w-24 rounded-full" />
                     <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                     </div>
                  </div>
               </div>

               {/* Account Overview Skeleton */}
               <div className="bg-white rounded-lg shadow-sm p-8">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-lg">
                           <Skeleton className="h-4 w-32 mb-2" />
                           <Skeleton className="h-8 w-16" />
                        </div>
                     ))}
                  </div>
               </div>

               {/* Personal Information Skeleton */}
               <div className="bg-white rounded-lg shadow-sm p-8">
                  <Skeleton className="h-6 w-48 mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                     ))}
                  </div>

                  {/* Address Skeleton */}
                  <div className="mt-6">
                     <Skeleton className="h-6 w-32 mb-6" />
                     <Skeleton className="h-10 w-full" />
                  </div>

                  {/* Security Section Skeleton */}
                  <div className="mt-6">
                     <Skeleton className="h-6 w-48 mb-6" />
                     <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                           <div className="space-y-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-32" />
                           </div>
                           <Skeleton className="h-9 w-32" />
                        </div>
                     </div>
                  </div>

                  {/* Recent Activity Skeleton */}
                  <div className="mt-6">
                     <Skeleton className="h-6 w-40 mb-6" />
                     <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                           <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                 <Skeleton className="h-2 w-2 rounded-full" />
                                 <Skeleton className="h-4 w-32" />
                              </div>
                              <Skeleton className="h-4 w-24" />
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-background border rounded-lg shadow-sm p-8">
               <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile Settings</h1>
                  {isEditing ? (
                     <div className="flex gap-3">
                        <Button
                           variant="outline"
                           onClick={handleCancel}
                        >
                           Cancel
                        </Button>
                        <Button
                           onClick={handleSubmit}
                           disabled={isLoading}
                           className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
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
                  ) : (
                     <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="bg-white text-black hover:bg-gray-100"
                     >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile
                     </Button>
                  )}
               </div>

               {/* Profile Picture Section */}
               <div className="flex items-center space-x-6">
                  <div className="relative">
                     <div
                        className={`h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center text-2xl text-muted-foreground border-2 ${isEditing ? 'border-green-500 cursor-pointer' : 'border-transparent'}`}
                        onClick={() => isEditing && setShowPhotoOptions(true)}
                     >
                        {userInfo.profilePicture ? (
                           <img
                              src={userInfo.profilePicture}
                              alt="Profile"
                              className="h-full w-full object-cover"
                           />
                        ) : (
                           <span>
                              {userInfo.fullName.split(' ')[0][0]}
                              {userInfo.fullName.split(' ').slice(-1)[0][0]}
                           </span>
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
                     <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{userInfo.fullName}</h2>
                     <p className="text-sm text-muted-foreground">Permit Applicant</p>
                  </div>
               </div>
            </div>

            {/* Account Overview Section */}
            <div className="bg-background border rounded-lg shadow-sm p-8">
               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Overview</h3>
               <Separator className="mb-4 dark:border-gray-700" />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                     <h4 className="text-sm font-medium text-muted-foreground">Total Applications</h4>
                     <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{userStats.totalApplications}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                     <h4 className="text-sm font-medium text-muted-foreground">Active Permits</h4>
                     <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{userStats.activePermits}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                     <h4 className="text-sm font-medium text-muted-foreground">Pending Payments</h4>
                     <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{userStats.pendingPayments}</p>
                  </div>
               </div>
            </div>

            {/* Personal Information Form */}
            <div className="bg-background border rounded-lg shadow-sm p-8">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
                     <Separator className="mb-4 dark:border-gray-700" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                           <Input
                              id="fullName"
                              value={userInfo.fullName}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? 'bg-muted dark:bg-gray-800' : ''}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="username" className="text-foreground">Username</Label>
                           <Input
                              id="username"
                              value={userInfo.username}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? 'bg-muted dark:bg-gray-800' : ''}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="email" className="text-foreground">Email</Label>
                           <Input
                              id="email"
                              type="email"
                              value={userInfo.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? 'bg-muted dark:bg-gray-800' : ''}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="phone" className="text-foreground">Phone</Label>
                           <Input
                              id="phone"
                              value={userInfo.phone}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? 'bg-muted dark:bg-gray-800' : ''}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="company" className="text-foreground">Company</Label>
                           <Input
                              id="company"
                              value={userInfo.company}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? 'bg-muted dark:bg-gray-800' : ''}
                           />
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
                     <Separator className="mb-4 dark:border-gray-700" />
                     <div className="space-y-2">
                        <Label htmlFor="address" className="text-foreground">Complete Address</Label>
                        <Input
                           id="address"
                           value={userInfo.address}
                           onChange={handleInputChange}
                           disabled={!isEditing}
                           className={!isEditing ? 'bg-muted dark:bg-gray-800' : ''}
                        />
                     </div>
                  </div>

                  {/* Account Security Section */}
                  <div>
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Security</h3>
                     <Separator className="mb-4 dark:border-gray-700" />
                     <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="font-medium">Password</h4>
                              <p className="text-sm text-gray-500">{getPasswordChangeText()}</p>
                           </div>
                           <Button variant="outline" size="sm" onClick={() => setIsChangePasswordOpen(true)} className="bg-white text-black hover:bg-gray-100">
                              Change Password
                           </Button>
                        </div>
                     </div>
                  </div>

                  {/* Account Activity Section */}
                  <div>
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                     <Separator className="mb-4 dark:border-gray-700" />
                     <div className="space-y-4">
                        {activities.map((activity) => (
                           <div key={activity.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                 {getActivityIcon(activity.type)}
                                 <span className="text-gray-900 dark:text-white">{getActivityText(activity.type)}</span>
                              </div>
                              <span className="text-muted-foreground">
                                 {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                              </span>
                           </div>
                        ))}
                        {activities.length === 0 && (
                           <p className="text-muted-foreground text-center">No recent activity</p>
                        )}
                     </div>
                  </div>
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
