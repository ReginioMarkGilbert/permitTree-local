import React, { useState, useRef } from 'react'
import { Leaf } from 'lucide-react'

export default function Component() {
    const [sidebarToggle, setSidebarToggle] = useState(false)
    const [userInfo, setUserInfo] = useState({
        fullName: 'John Doe',
        email: 'johndoe@example.com',
        phone: '+63 912 345 6789',
        address: '123 Main St, City, State, ZIP',
        company: 'Company Name',
    })
    const [profilePicture, setProfilePicture] = useState(null)
    const [showPhotoOptions, setShowPhotoOptions] = useState(false)
    const fileInputRef = useRef(null)

    const handleInputChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.id]: e.target.value })
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

    const handleSubmit = (e) => {
        e.preventDefault()
        // Here you would typically send the updated userInfo and profilePicture to your backend
        console.log('Updated user info:', userInfo)
        console.log('Updated profile picture:', profilePicture)
        // Show a success message to the user
        alert('Changes saved successfully!')
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-md z-10 flex justify-between items-center p-4">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setSidebarToggle(!sidebarToggle)}
                        className="text-green-800 p-2 rounded-md hover:bg-gray-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <Leaf className="h-8 w-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-800">PermitTree</span>
                </div>
            </nav>

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
                            <h2 className="text-2xl font-bold text-green-800">{userInfo.fullName}</h2>
                            <p className="text-green-600">Permit Applicant</p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-green-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
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
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                    </span>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={userInfo.phone}
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
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-green-700 mb-1">Company</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
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
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-md"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
