import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/UserProfilePage.css';
import axios from 'axios';

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
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token'); // Ensure the token is stored correctly
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await axios.get('http://localhost:3000/api/user', {
                    headers: {
                        Authorization: token
                    }
                });
                setUser(response.data);
            } catch (error) {
                toast.error('Failed to fetch user details');
                console.error(error);
            }
        };

        fetchUserDetails();
    }, []);

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token'); // Ensure the token is stored correctly
            await axios.put('http://localhost:3000/api/user', user, {
                headers: {
                    Authorization: token
                }
            });
            toast.success('Profile updated successfully');
            setEditMode(false);
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            toast.error('Failed to update profile');
            console.error(error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser(prevState => ({ ...prevState, [name]: value }));
    };

    return (
        <div className="flex h-screen justify-center items-center mt-[-30px]">
            <div className="container px-4">
                <div className="profile-header">
                    <img src={user.profilePhoto || 'default-profile.png'} alt="Profile" className="profile-img" />
                    <div className="profile-info">
                        {editMode ? (
                            <input type="text" value={user.username} onChange={handleChange} name="username" className="profile-info-input" />
                        ) : (
                            <h2>{user.username}</h2>
                        )}
                        <p>{user.email}</p>
                    </div>
                </div>
                <div className="profile-actions">
                    {editMode ? (
                        <button onClick={handleSave} className="save-button">Save</button>
                    ) : (
                        <button onClick={handleEdit} className="icon-button"><i className="fa fa-pencil"></i></button>
                    )}
                </div>
                <div className="info-grid">
                    {Object.entries(user).map(([key, value]) => (
                        key !== 'profilePhoto' && key !== 'accountCreated' && (
                            <div className="info-card" key={key}>
                                <label>{key}</label>
                                {editMode ? (
                                    <input type="text" value={value} onChange={handleChange} name={key} className="info-input" />
                                ) : (
                                    <p>{value}</p>
                                )}
                            </div>
                        )
                    ))}
                </div>
                <ToastContainer />
            </div>
        </div>
    );
};

export default UserProfilePage;