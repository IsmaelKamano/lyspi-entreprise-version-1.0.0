import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { API, SOCKET } from '../config/api';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const PUBLIC_VAPID_KEY = 'BGis7GkE_nZE6FsfpuNOFt_Hc02_lyUqVUhOLgwitPmxt2Ze5uTomnu9xlEJd-mck8VrtHAfg2gQv_iGmUA1Cfc'; // Replace with your generated key

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [userId, setUserId] = useState(null); // Should come from AuthContext

    // Initialize Socket and Fetch Notifications
    useEffect(() => {
        // Get user ID from localStorage or AuthContext
        const storedUser = localStorage.getItem('user'); // Adjust based on your auth storage
        const user = storedUser ? JSON.parse(storedUser) : null;
        const id = user?.id || localStorage.getItem('entrepriseId'); // Fallback

        if (id) {
            setUserId(id);
            const newSocket = io(SOCKET); // Backend URL
            setSocket(newSocket);

            newSocket.emit('join', id);

            newSocket.on('notification', (notification) => {
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);
                toast.info(notification.message);
            });

            // Fetch initial notifications
            fetchNotifications();

            return () => newSocket.close();
        }
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token'); // Adjust based on auth
            if (!token) return;

            const response = await axios.get(`${API}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setNotifications(response.data.data.notifications);
                setUnreadCount(response.data.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Push Subscription
    const subscribeToPush = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const register = await navigator.serviceWorker.register('/sw.js');
                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
                });

                const token = localStorage.getItem('token');
                await axios.post(`${API}/notifications/subscribe`, subscription, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Push Subscribed');
            } catch (error) {
                console.error('Push Subscription Error:', error);
            }
        }
    };

    // Helper function for VAPID key conversion
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, subscribeToPush }}>
            {children}
        </NotificationContext.Provider>
    );
};
