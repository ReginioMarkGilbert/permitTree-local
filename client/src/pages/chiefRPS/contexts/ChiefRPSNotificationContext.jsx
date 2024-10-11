import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { isAuthenticated } from '../../../utils/auth';

const ChiefRPSNotificationContext = createContext();

export const useChiefRPSNotification = () => useContext(ChiefRPSNotificationContext);

const ChiefRPSNotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        if (!isAuthenticated()) {
            setUnreadCount(0); // Reset count if not authenticated
            return;
        }
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
        let intervalId;
        if (isAuthenticated()) {
            fetchUnreadCount();
            intervalId = setInterval(fetchUnreadCount, 9000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
        // fetchUnreadCount();
    }, [fetchUnreadCount]);

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
