import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'; // Import useLocation
import axios from 'axios'; // Import axios for making HTTP requests
import { toast, ToastContainer } from 'react-toastify'; // Import toast for notifications

export default function Component() {
    const [sidebarToggle, setSidebarToggle] = useState(false)
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        company: ''
    });
    const [profilePicture, setProfilePicture] = useState(null)
    const [showPhotoOptions, setShowPhotoOptions] = useState(false)
    const fileInputRef = useRef(null)
    const [user, setUser] = useState({ firstName: '', lastName: '' }); // State for user details

    const location = useLocation(); // Get the current location

    // Fetch user details on component mount or when location changes
    useEffect(() => {
        fetchUserDetails(); // Call the function to fetch user details
    }, [location]); // Add location as a dependency

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token'); // Get the token from local storage
            const response = await axios.get('http://localhost:3000/api/user-details', {
                headers: {
                    Authorization: token // Include the token in the headers
                }
            });
            console.log('User details response:', response.data); // Log the response
            const { firstName, lastName, email, phone, address, company } = response.data.user; // Destructure user details
            setUser({ firstName, lastName }); // Set user state
            setUserInfo({
                fullName: `${firstName} ${lastName}`, // Update fullName
                email: email || '', // Ensure email is set correctly
                phone: phone || '', // Ensure phone is set correctly
                address: address || '', // Ensure address is set correctly
                company: company || '' // Ensure company is set correctly
            });
            console.log('Updated userInfo:', userInfo); // Verify the state after fetching
        } catch (err) {
            console.error('Error fetching user details:', err);
            toast.error('Failed to fetch user details.'); // Show error notification
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setUserInfo(prev => ({ ...prev, [id]: value }));
    }

    const handleProfilePictureClick = () => {
        setShowPhotoOptions(true)
    }

    const handleUploadPhoto = () => {
        fileInputRef.current.click()
        setShowPhotoOptions(false)
    }

    const handleRemovePhoto = () => {
        setProfilePicture(null)
        setShowPhotoOptions(false)
    }

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfilePicture(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token'); // Get the token from local storage
            const [firstName, lastName] = userInfo.fullName.split(' '); // Split fullName into firstName and lastName

            const response = await axios.put('http://localhost:3000/api/user-profile', {
                firstName, // Send firstName
                lastName,  // Send lastName
                email: userInfo.email,
                phone: userInfo.phone,
                company: userInfo.company,
                address: userInfo.address,
                profilePicture // Include the profile picture
            }, {
                headers: {
                    Authorization: token // Include the token in the headers
                }
            });

            // Show a success message to the user
            toast.success('Profile updated successfully!');
            fetchUserDetails(); // Fetch updated user details after successful update
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('Failed to update profile.');
        }
    }

    return (
        <div className="min-h-screen bg-green-50 flex flex-col">
            <ToastContainer />
            {/* Main Content */}
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-green-100 p-6 flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div
                                className="bg-gray-300 rounded-full w-32 h-32 flex items-center justify-center text-5xl text-gray-600 overflow-hidden cursor-pointer"
                                onClick={handleProfilePictureClick}
                            >
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    userInfo.fullName.split(' ').map(n => n[0]).join('')
                                )}
                            </div>
                            {showPhotoOptions && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-2 z-10">
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                                        onClick={handleUploadPhoto}
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
                                onChange={handleProfilePictureChange}
                            />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-green-800">{user.firstName} {user.lastName}</h2>
                            <p className="text-green-600">Permit Applicant</p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-green-700 mb-1">Full Name</label>
                            <div className="relative w-1/2"> {/* Added w-1/2 to restrict the width */}
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 2.93A7 7 0 0115.07 13.95L10 19l-5.07-5.05a7 7 0 010-9.9zM7 7a3 3 0 106 0 3 3 0 00-6 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={userInfo.fullName}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-green-700 mb-1">Email</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        value={userInfo.email}
                                        onChange={handleInputChange}
                                        className="pl-10 w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-green-700 mb-1">Phone</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 3a1 1 0 011-1h3a1 1 0 011 1v2.271a1 1 0 01-.293.707L5.414 7.879a12.043 12.043 0 005.707 5.707l1.9-1.9a1 1 0 01.707-.293H15a1 1 0 011 1v3a1 1 0 01-1 1h-1c-7.18 0-13-5.82-13-13V4a1 1 0 011-1z" />
                                        </svg>
                                    </span>
                                    <input
                                        id="phone"
                                        type="text"
                                        value={userInfo.phone}
                                        onChange={handleInputChange}
                                        className="pl-10 w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-green-700 mb-1">Company</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 10h10V5H5v8z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <input
                                    id="company"
                                    type="text"
                                    value={userInfo.company}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-green-700 mb-1">Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 2.93A7 7 0 0115.07 13.95L10 19l-5.07-5.05a7 7 0 010-9.9zM7 7a3 3 0 106 0 3 3 0 00-6 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <input
                                    id="address"
                                    type="text"
                                    value={userInfo.address}
                                    onChange={handleInputChange}
                                    className="pl-10 w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out">Save Changes</button>
                    </form>
                </div>
            </div>
        </div>
    )
}
