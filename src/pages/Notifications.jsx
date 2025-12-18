import React from 'react';
import { useNotification } from '../context/NotificationContext';

const Notifications = () => {
    const { notifications, markAsRead } = useNotification();

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Vos Notifications</h1>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {notifications.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {notifications.map((notif) => (
                                <li
                                    key={notif._id || Math.random()}
                                    className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => markAsRead(notif._id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-medium ${!notif.read ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {notif.title || 'Notification'}
                                            </h3>
                                            <p className="mt-1 text-gray-600">{notif.message}</p>
                                            <p className="mt-2 text-sm text-gray-400">
                                                {new Date(notif.createdAt).toLocaleDateString()} à {new Date(notif.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Non lu
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune notification</h3>
                            <p className="mt-1 text-sm text-gray-500">Vous n'avez pas de nouvelles notifications pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
