import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { isAuthenticated } from '../../../utils/auth';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        if (!isAuthenticated()) {
            setUnreadCount(0);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/user/notifications/unread-count', {
                headers: { Authorization: token }
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread notification count:', error);
        }
    };

    useEffect(() => {
        let intervalId;
        if (isAuthenticated()) {
            fetchUnreadCount();
            intervalId = setInterval(fetchUnreadCount, 9000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };

    }, [fetchUnreadCount]);

    const value = {
        unreadCount,
        setUnreadCount,
        fetchUnreadCount
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
