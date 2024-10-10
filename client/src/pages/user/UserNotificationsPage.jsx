import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Bell, X, AlertCircle, CheckCircle, Clock, FileText, RotateCcw, Mail } from 'lucide-react';
import '../../components/ui/styles/customScrollBar.css';
import { useNotification } from './contexts/UserNotificationContext';
import { isAuthenticated } from '../../utils/auth';
import './styles/UserNotification.css';

function UserNotificationsPage() {
    const { fetchUnreadCount, unreadCount } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [deletedNotification, setDeletedNotification] = useState(null);
    const [showUndo, setShowUndo] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/user/notifications', {
                headers: { Authorization: token }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let intervalId;
        if (isAuthenticated()) {
            fetchNotifications();
            intervalId = setInterval(fetchNotifications, 30000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchNotifications]);

    useEffect(() => {
        let timer;
        if (showUndo) {
            timer = setTimeout(() => {
                setShowUndo(false);
                setDeletedNotification(null);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [showUndo]);

    const handleNotificationClick = useCallback(async (notification) => {
        setSelectedNotification(notification);
        if (!notification.read) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.patch(
                    `http://localhost:3000/api/user/notifications/${notification._id}/read`,
                    {},
                    { headers: { Authorization: token } }
                );
                const updatedNotification = response.data;
                setNotifications(prev => prev.map(n =>
                    n._id === updatedNotification._id ? updatedNotification : n
                ));
                fetchUnreadCount();
            } catch (error) {
                console.error('Error marking notification as read:', error);
                toast.error('Failed to mark notification as read');
            }
        }
    }, [fetchUnreadCount]);

    const handleDelete = useCallback(async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/user/notifications/${id}`, {
                headers: { Authorization: token }
            });
            const notificationToDelete = notifications.find(n => n._id === id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            setDeletedNotification(notificationToDelete);
            setShowUndo(true);
            fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    }, [notifications, fetchUnreadCount]);

    const handleUndo = useCallback(() => {
        if (deletedNotification) {
            setNotifications(prev => [...prev, deletedNotification]);
            setShowUndo(false);
            setDeletedNotification(null);
        }
    }, [deletedNotification]);

    const handleMarkUnread = useCallback(async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `http://localhost:3000/api/user/notifications/${id}/unread`,
                {},
                { headers: { Authorization: token } }
            );
            const updatedNotification = response.data;
            setNotifications(prev => prev.map(n =>
                n._id === updatedNotification._id ? updatedNotification : n
            ));
            setSelectedNotification(null);
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking notification as unread:', error);
            toast.error('Failed to mark notification as unread');
        }
    }, [fetchUnreadCount]);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:3000/api/user/notifications/mark-all-read',
                {},
                { headers: { Authorization: token } }
            );
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            fetchUnreadCount();
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    }, [fetchUnreadCount]);

    const formatNotificationType = useMemo(() => (type) => {
        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }, []);

    const getIcon = useMemo(() => (type) => {
        const formattedType = formatNotificationType(type).toLowerCase();
        switch (formattedType) {
            case 'application returned': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'application accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'application submitted': return <FileText className="w-5 h-5 text-blue-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    }, [formatNotificationType]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-24">
            <div className="max-w-3xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-green-800">Notifications</h1>
                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <button
                                onClick={handleMarkAllAsRead}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                                aria-label="Mark all as read"
                            >
                                <Mail className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                            </button>
                            <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -left-8 top-full mt-1 transform -translate-x-1/2 whitespace-nowrap">
                                Mark all as read
                            </span>
                        </div>
                        <Bell className="w-6 h-6 text-green-600" />
                    </div>
                </header>

                {/* Notifications container */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="h-[calc(100vh-15.9375rem)] max-h-[40rem] overflow-y-auto pr-4 custom-scrollbar">
                        {loading ? (
                            <p>Loading notifications...</p>
                        ) : notifications.length === 0 ? (
                            <p>No notifications</p>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`mb-4 p-4 rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg cursor-pointer border-l-4 ${!notification.read ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
                                        }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start space-x-3">
                                            {getIcon(notification.type)}
                                            <div>
                                                <h2 className={`text-lg font-semibold mb-1 ${!notification.read ? 'text-green-700' : 'text-gray-700'
                                                    }`}>{formatNotificationType(notification.type)}</h2>
                                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                                <p className="text-xs text-gray-400 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(notification._id); }}
                                            className="text-red-500 hover:text-red-700 rounded-md p-1 transition-colors duration-200 hover:bg-red-100"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {selectedNotification && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h2 className="text-xl font-bold text-green-800 mb-4">{selectedNotification.type}</h2>
                            <p className="text-gray-600 mb-4">{selectedNotification.message}</p>
                            <p className="text-sm text-gray-400 mb-4">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                            <div className="flex justify-between">
                                <button
                                    onClick={() => handleMarkUnread(selectedNotification._id)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Mark as Unread
                                </button>
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showUndo && (
                    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
                        <p>Notification deleted</p>
                        <button onClick={handleUndo} className="bg-green-500 px-3 py-1 rounded-md hover:bg-green-600 transition-colors">
                            Undo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(UserNotificationsPage);
