import React, { createContext, useState, useContext, useCallback } from 'react';
import { isAuthenticated } from '../../../utils/auth';

const ChiefRPSNotificationContext = createContext();

export const useChiefRPSNotification = () => useContext(ChiefRPSNotificationContext);

const ChiefRPSNotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        // Temporarily disabled
        if (isAuthenticated()) {
            setUnreadCount(0);
        }
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
