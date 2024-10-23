import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { gql, useQuery, useMutation } from '@apollo/client';

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
   const location = useLocation();

   const { loading, error, data, refetch } = useQuery(GET_USER_DETAILS);
   const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);

   useEffect(() => {
      if (data && data.getUserDetails) {
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
      console.log('Loading user data...');
      return <p>Loading...</p>;
   }
   if (error) {
      console.error('Error fetching user data:', error);
      // You might want to redirect to login page here
      return <p>Error: {error.message}</p>;
   }

   return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
         <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
            <div className="bg-green-100 p-6 flex flex-col items-center space-y-4">
               <div className="relative">
                  <div
                     className={`bg-gray-300 rounded-full w-32 h-32 flex items-center justify-center text-5xl text-gray-600 overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
                     onClick={handleProfilePictureClick}
                  >
                     {userInfo.profilePicture ? (
                        <img src={userInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                        <span>{userInfo.fullName.split(' ').map(n => n[0]).join('')}</span>
                     )}
                  </div>
                  {isEditing && showPhotoOptions && (
                     <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-2 z-10">
                        <button
                           className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                           onClick={() => fileInputRef.current.click()}
                        >
                           Upload/change photo
                        </button>
                        <button
                           className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                           onClick={handleRemovePhoto}
                        >
                           Remove photo
                        </button>
                     </div>
                  )}
                  <input
                     type="file"
                     ref={fileInputRef}
                     className="hidden"
                     accept="image/*"
                     onChange={handleFileChange}
                     disabled={!isEditing}
                  />
               </div>
               <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-800">{userInfo.fullName}</h2>
                  <p className="text-green-600">Permit Applicant</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label htmlFor="fullName" className="block text-sm font-medium text-green-700 mb-1">Full Name</label>
                     <input
                        id="fullName"
                        type="text"
                        value={userInfo.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClasses}
                     />
                  </div>
                  <div>
                     <label htmlFor="email" className="block text-sm font-medium text-green-700 mb-1">Email</label>
                     <input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClasses}
                     />
                  </div>
                  <div>
                     <label htmlFor="phone" className="block text-sm font-medium text-green-700 mb-1">Phone</label>
                     <input
                        id="phone"
                        type="text"
                        value={userInfo.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClasses}
                     />
                  </div>
                  <div>
                     <label htmlFor="company" className="block text-sm font-medium text-green-700 mb-1">Company</label>
                     <input
                        id="company"
                        type="text"
                        value={userInfo.company}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClasses}
                     />
                  </div>
               </div>
               <div>
                  <label htmlFor="address" className="block text-sm font-medium text-green-700 mb-1">Address</label>
                  <input
                     id="address"
                     type="text"
                     value={userInfo.address}
                     onChange={handleInputChange}
                     disabled={!isEditing}
                     className={inputClasses}
                  />
               </div>
               <div className="flex justify-end">
                  {isEditing && (
                     <button
                        type="button"
                        onClick={handleCancel} // Discard changes
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out mr-2"
                     >
                        Cancel
                     </button>
                  )}
                  <button
                     type="submit"
                     className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                  >
                     {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
