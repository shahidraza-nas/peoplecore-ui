"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    requestNotificationPermission,
    onMessageListener,
    showNotification,
    getFcmTokenFromStorage,
    saveFcmTokenToStorage,
} from '@/lib/firebase';
import { toast } from 'sonner';

interface NotificationContextProps {
    fcmToken: string | null;
    permission: NotificationPermission;
}

const NotificationContext = createContext<NotificationContextProps>({
    fcmToken: null,
    permission: 'default',
});

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check for existing token
        const existingToken = getFcmTokenFromStorage();
        if (existingToken) {
            setFcmToken(existingToken);
        }

        // Request permission and get token
        const initializeFCM = async () => {
            try {
                const currentPermission = Notification.permission;
                setPermission(currentPermission);

                if (currentPermission === 'granted' && !existingToken) {
                    try {
                        const token = await requestNotificationPermission();
                        if (token) {
                            setFcmToken(token);
                            saveFcmTokenToStorage(token);
                        }
                    } catch (tokenError) {
                        console.warn('Failed to get FCM token (non-critical):', tokenError);
                        // Don't throw - app can work without push notifications
                    }
                }

                // Listen for foreground messages
                const unsubscribe = onMessageListener((payload) => {
                    const title = payload?.notification?.title || payload?.data?.title || 'New Notification';
                    const body = payload?.notification?.body || payload?.data?.body;
                    
                    toast(`${title}${body ? ': ' + body : ''}`, {
                        duration: 5000,
                        position: 'top-right',
                    });

                    // Show browser notification
                    showNotification(title, {
                        body: body || '',
                        tag: payload?.data?.chatUid || 'notification',
                        data: payload?.data,
                    });
                });

                return unsubscribe;
            } catch (err) {
                console.warn('Unable to initialize notifications (non-critical):', err);
                // Don't block app initialization if notifications fail
            }
        };

        initializeFCM();
    }, []);

    return (
        <NotificationContext.Provider value={{ fcmToken, permission }}>
            {children}
        </NotificationContext.Provider>
    );
};
