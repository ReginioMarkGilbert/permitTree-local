import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Bell, X, AlertCircle, CheckCircle, Clock, FileText, RotateCcw, Mail } from 'lucide-react';
import '../../components/ui/styles/customScrollBar.css';
import { useNotification } from './contexts/UserNotificationContext';
import { isAuthenticated } from '../../utils/auth';
import './styles/UserNotification.css';
import useDebounce from '../../hooks/useDebounce';

function UserNotificationsPage() {
   const { fetchUnreadCount, unreadCount } = useNotification();
   const [notifications, setNotifications] = useState([]);
   const [loading, setLoading] = useState(false);
   const [selectedNotification, setSelectedNotification] = useState(null);
   const [deletedNotification, setDeletedNotification] = useState(null);
   const [showUndo, setShowUndo] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const debouncedSearchTerm = useDebounce(searchTerm, 300);

   const fetchNotifications = useCallback(async () => {
      // Temporarily disabled
      setNotifications([]);
      setLoading(false);
   }, [debouncedSearchTerm]);

   useEffect(() => {
      fetchNotifications();
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
   }, []);

   const handleDelete = useCallback(async (id) => {
      // Temporarily disabled
   }, []);

   const handleUndo = useCallback(() => {
      if (deletedNotification) {
         setNotifications(prev => [...prev, deletedNotification]);
         setShowUndo(false);
         setDeletedNotification(null);
      }
   }, [deletedNotification]);

   const handleMarkUnread = useCallback(async (id) => {
      // Temporarily disabled
   }, []);

   const handleMarkAllAsRead = useCallback(async () => {
      // Temporarily disabled
   }, []);

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
                  <Bell className="w-6 h-6 text-green-600" />
               </div>
            </header>

            <div className="bg-white rounded-lg shadow-md p-6">
               <p>Notifications are currently unavailable.</p>
            </div>
         </div>
      </div>
   );
}

export default React.memo(UserNotificationsPage);
