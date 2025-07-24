import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

const BASE_URL = 'http://localhost:8085';

interface NotificationItem {
    _id: string;
    user: string;
    notification: {
        notification: string;
        read: boolean;

    },
    createdAt: string
    ;
}

function formatMongoDBDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);

    let dayOfWeek = '';
    let month = '';
    let dayOfMonth = '';
    let hour = '';
    let minute = '';

    for (const part of parts) {
        switch (part.type) {
            case 'weekday':
                dayOfWeek = part.value;
                break;
            case 'month':
                month = part.value;
                break;
            case 'day':
                dayOfMonth = part.value;
                break;
            case 'hour':
                hour = part.value;
                break;
            case 'minute':
                minute = part.value;
                break;
        }
    }
    return `${dayOfWeek}, ${month} ${dayOfMonth} at ${hour}:${minute}`;
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const userID = sessionStorage.getItem('userID');
    const accessToken = sessionStorage.getItem('authToken');

    const getAuthHeaders = useCallback(() => {
        if (!accessToken) {
            setError('Authentication token not found. Please log in.');
            return {};
        }
        return {
            'Authorization': accessToken,
            'Content-Type': 'application/json',
        };
    }, [accessToken]);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        setActionMessage(null);

        if (!userID) {
            setError('User ID not found. Please log in.');
            setLoading(false);
            return;
        }

        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/notifications/${userID}`, {
                headers: {
                    'Authorization': sessionStorage.getItem("authToken") || ""
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch notifications: ${response.status}`);
            }
            const data: NotificationItem[] = await response.json();
            setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); // Sort by newest first
        } catch (err: any) {
            setError(`Error fetching notifications: ${err.message}`);
            console.error('Fetch notifications error:', err);
        } finally {
            setLoading(false);
        }
    }, [userID, getAuthHeaders]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAllAsRead = async () => {
        setActionMessage(null);
        if (!userID) {
            setActionMessage('Error: User ID not found.');
            return;
        }

        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) return;

        try {
            const response = await fetch(`${BASE_URL}/read_notifications/${userID}`, {
                method: 'GET',
                headers: {
                    'Authorization': sessionStorage.getItem("authToken") || ""
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to mark notifications as read: ${response.status}`);
            }
            setActionMessage('All notifications marked as read.');
            fetchNotifications(); // Refresh the list
        } catch (err: any) {
            setActionMessage(`Error marking as read: ${err.message}`);
            console.error('Mark all as read error:', err);
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        setActionMessage(null);
        if (!userID) {
            setActionMessage('Error: User ID not found.');
            return;
        }

        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) return;

        try {
            const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': sessionStorage.getItem("authToken") || ""
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete notification: ${response.status}`);
            }
            setActionMessage('Notification deleted.');
            fetchNotifications(); // Refresh the list
        } catch (err: any) {
            setActionMessage(`Error deleting notification: ${err.message}`);
            console.error('Delete notification error:', err);
        }
    };

    const handleClearAllNotifications = async () => {
        setActionMessage(null);
        if (!userID) {
            setActionMessage('Error: User ID not found.');
            return;
        }

        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) return;

        if (!window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/clear_notifications/${userID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': sessionStorage.getItem("authToken") || ""
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to clear all notifications: ${response.status}`);
            }
            setActionMessage('All notifications cleared.');
            setNotifications([]);
        } catch (err: any) {
            setActionMessage(`Error clearing all notifications: ${err.message}`);
            console.error('Clear all notifications error:', err);
        }
    };




    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-start">
                <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto bg-white rounded-lg shadow-xl flex flex-col min-h-[calc(100vh-2rem)]">

                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-[#6f66c7] to-[#d38de7] text-white p-5 flex justify-between items-center relative z-10 rounded-t-lg rounded-b-[20px] md:rounded-b-none">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🔔</span> {/* Bell icon */}
                            <span className="font-semibold text-lg">Notifications</span>
                        </div>
                        {/* Subtle shadow for header */}
                        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4/5 h-5 bg-black/10 rounded-full blur-md -z-10"></div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 p-5 bg-white rounded-t-lg">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="px-4 py-2 bg-[#3fccd6] text-white rounded-md text-sm font-medium hover:bg-[#6f66c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3fccd6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || notifications.length === 0 || notifications.every(n => n.notification.read)}
                        >
                            Mark All as Read
                        </button>
                        <button
                            onClick={handleClearAllNotifications}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || notifications.length === 0}
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Action Message Display */}
                    {actionMessage && (
                        <div className={`mx-5 p-3 rounded-md text-sm mb-4 ${actionMessage.includes('Error') ? 'bg-gray-200 text-gray-800' : 'bg-[#94d5fa] text-[#6f66c7]'}`}>
                            {actionMessage}
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="flex-grow p-5 overflow-y-auto bg-gray-50 rounded-b-lg">
                        {loading ? (
                            <div className="text-center text-gray-500 py-10">Loading notifications...</div>
                        ) : error ? (
                            <div className="text-center text-gray-800 bg-gray-200 p-4 rounded-md my-4">{error}</div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">You have no notifications.</div>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`flex items-center p-4 rounded-lg shadow-sm border ${notification.notification.read ? 'bg-white border-gray-200' : 'bg-[#94d5fa] border-[#3fccd6]'
                                            } transition-all duration-300`}
                                    >

                                        <div className="flex-grow">
                                            <p className={`font-medium ${notification.notification.read ? 'text-gray-800' : 'text-gray-900'}`}>
                                                {notification.notification.notification}
                                            </p>
                                            <p className={`text-xs ${notification.notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                                {formatMongoDBDate(notification.createdAt)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteNotification(notification._id)}
                                            className="ml-4 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                                            title="Delete Notification"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Notifications;
