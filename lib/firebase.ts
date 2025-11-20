import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";
import type { MessagePayload } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let messaging: Messaging | null = null;

// Initialize messaging only in browser
export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window === "undefined") return null;
  
  try {
    if (!messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.error("Failed to initialize Firebase Messaging:", error);
    return null;
  }
};

/**
 * Request notification permission and get FCM token
 * @returns FCM token or null if permission denied or error
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications not supported in this browser");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    // Register service worker
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("Service Worker registered successfully:", registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
    }

    // Get FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      console.log("FCM Token obtained:", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission or FCM token:", error);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @param callback Function to handle incoming messages
 */
export const onMessageListener = (callback: (payload: MessagePayload) => void): (() => void) => {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    callback(payload);
  });

  return unsubscribe;
};

/**
 * Show browser notification
 * @param title Notification title
 * @param options Notification options
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/images/icon-192x192.png",
      badge: "/images/badge-72x72.png",
      ...options,
    });
  }
};

/**
 * Check if FCM token exists in localStorage
 */
export const getFcmTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fcm_token");
};

/**
 * Save FCM token to localStorage
 */
export const saveFcmTokenToStorage = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("fcm_token", token);
};

/**
 * Clear FCM token from localStorage
 */
export const clearFcmTokenFromStorage = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("fcm_token");
};