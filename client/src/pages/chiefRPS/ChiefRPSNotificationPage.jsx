import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import '../../components/ui/styles/customScrollBar.css';
import { useChiefRPSNotification } from './contexts/ChiefRPSNotificationContext';
import './styles/ChiefRPSNotification.css';

function ChiefRPSNotificationPage() {
    const { fetchUnreadCount } = useChiefRPSNotification();
    const [notifications] = useState([]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-24">
            <div className="max-w-3xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-green-800">Notifications</h1>
                    <div className="flex items-center space-x-4">
                        <Bell className="w-6 h-6 text-green-600" />
                    </div>
                </header>

                {/* Notifications container */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="h-[calc(100vh-15.9375rem)] max-h-[40rem] overflow-y-auto pr-4 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <p>Notifications are currently unavailable.</p>
                        ) : (
                            // This part won't be reached with the current setup, but left for future implementation
                            notifications.map((notification) => (
                                <div key={notification._id}>
                                    {/* Notification content */}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(ChiefRPSNotificationPage);
