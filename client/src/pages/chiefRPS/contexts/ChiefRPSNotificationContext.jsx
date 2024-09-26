import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ChiefRPSNotificationContext = createContext();

export const useChiefRPSNotification = () => useContext(ChiefRPSNotificationContext);

const ChiefRPSNotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/admin/notifications/unread-count', {
                headers: { Authorization: token }
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread notification count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    const value = {
        unreadCount,
        setUnreadCount,
        fetchUnreadCount
    };

    return (
        <ChiefRPSNotificationContext.Provider value={value}>
            {children}
        </ChiefRPSNotificationContext.Provider>
    );
};

export default ChiefRPSNotificationProvider;
