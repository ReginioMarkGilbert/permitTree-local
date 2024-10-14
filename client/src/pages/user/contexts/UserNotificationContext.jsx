import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { isAuthenticated } from '../../../utils/auth';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        // Temporarily disabled
        setUnreadCount(0);
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            fetchUnreadCount();
        }
    }, [fetchUnreadCount]);

    const value = React.useMemo(() => ({
        unreadCount,
        setUnreadCount,
        fetchUnreadCount
    }), [unreadCount, fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default React.memo(NotificationProvider);
