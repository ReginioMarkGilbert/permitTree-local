import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Bell, X, AlertCircle, CheckCircle, Clock, FileText, RotateCcw } from 'lucide-react';
import '../../components/ui/styles/customScrollBar.css';
import { useNotification } from './contexts/UserNotificationContext';
import { isAuthenticated } from '../../utils/auth';

function UserNotificationsPage() {
    const { fetchUnreadCount } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [deletedNotification, setDeletedNotification] = useState(null);
    const [showUndo, setShowUndo] = useState(false);

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

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/user/notifications', {
                headers: { Authorization: token }
            });
            setNotifications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to fetch notifications');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let intervalId;
        if (isAuthenticated()) {
            fetchNotifications();
            intervalId = setInterval(fetchNotifications, 10000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchNotifications]);

    const handleNotificationClick = async (notification) => {
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
                setNotifications(notifications.map(n =>
                    n._id === updatedNotification._id ? updatedNotification : n
                ));
                fetchUnreadCount(); // Update unread count
            } catch (error) {
                console.error('Error marking notification as read:', error);
                toast.error('Failed to mark notification as read');
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/user/notifications/${id}`, {
                headers: { Authorization: token }
            });
            const notificationToDelete = notifications.find(n => n._id === id);
            setNotifications(notifications.filter(n => n._id !== id));
            setDeletedNotification(notificationToDelete);
            setShowUndo(true);
            toast.success('Notification deleted successfully');
            fetchUnreadCount(); // Update unread count
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleUndo = () => {
        if (deletedNotification) {
            setNotifications([...notifications, deletedNotification]);
            setShowUndo(false);
            setDeletedNotification(null);
            // You might want to add an API call here to restore the notification in the backend
        }
    };

    const handleMarkUnread = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `http://localhost:3000/api/user/notifications/${id}/unread`,
                {},
                { headers: { Authorization: token } }
            );
            const updatedNotification = response.data;
            setNotifications(notifications.map(n =>
                n._id === updatedNotification._id ? updatedNotification : n
            ));
            setSelectedNotification(null);
            // toast.success('Notification marked as unread');
            fetchUnreadCount(); // Update unread count
        } catch (error) {
            console.error('Error marking notification as unread:', error);
            toast.error('Failed to mark notification as unread');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'info': return <FileText className="w-5 h-5 text-blue-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-24">
            <div className="max-w-3xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-green-800">Notifications</h1>
                    <Bell className="w-6 h-6 text-green-600" />
                </header>

                {/* Notifications container */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="h-[calc(100vh-15.9375rem)] max-h-[41rem] overflow-y-auto pr-4 custom-scrollbar">
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
                                                    }`}>{notification.type}</h2>
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

export default UserNotificationsPage;
