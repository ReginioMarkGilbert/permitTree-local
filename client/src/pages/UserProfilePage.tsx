import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserProfilePage: React.FC = () => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        phone: '',
        profilePhoto: '',
        address: '',
        birthDate: '',
        accountCreated: ''
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/user');
                setUser(response.data);
            } catch (error) {
                toast.error('Failed to fetch user details');
            }
        };
        fetchUserDetails();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:3000/api/user', user);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">User Profile</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Profile Photo</label>
                        <input type="file" className="form-input" name="profilePhoto" value={user.profilePhoto} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Username</label>
                        <input type="text" className="form-input" name="username" value={user.username} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input type="email" className="form-input" name="email" value={user.email} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Phone</label>
                        <input type="tel" className="form-input" name="phone" value={user.phone} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Address</label>
                        <textarea className="form-textarea" name="address" value={user.address} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Birth Date</label>
                        <input type="date" className="form-input" name="birthDate" value={user.birthDate} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Account Created</label>
                        <input type="text" className="form-input" name="accountCreated" value={user.accountCreated} onChange={handleChange} disabled />
                    </div>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Update Profile</button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
};

export default UserProfilePage;
