// [Firebase Messaging Service Worker]
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
// This will be dynamically injected by the app at registration time
// See: lib/firebase.ts for the injection logic
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    if (!firebase.apps.length) {
      firebase.initializeApp(event.data.config);
    }
  }
});

// Fallback configuration for direct service worker access
// This ensures the service worker works even if message isn't received
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  // These values should match your .env.local NEXT_PUBLIC_FIREBASE_* variables
  firebase.initializeApp({
    apiKey: self.FIREBASE_API_KEY || "AIzaSyA7-n8AnllA-91Cf7Y5e5aBmaxFtDHaQhQ",
    authDomain: self.FIREBASE_AUTH_DOMAIN || "people-core-53841.firebaseapp.com",
    projectId: self.FIREBASE_PROJECT_ID || "people-core-53841",
    storageBucket: self.FIREBASE_STORAGE_BUCKET || "people-core-53841.appspot.com",
    messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "710003038884",
    appId: self.FIREBASE_APP_ID || "1:710003038884:web:074617809c1bf72962a431",
    measurementId: self.FIREBASE_MEASUREMENT_ID || "G-SHS941HLMN"
  });
}

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload?.notification?.title || payload?.data?.title || 'New Message';
  const notificationBody = payload?.notification?.body || payload?.data?.body || 'You have a new message';
  
  // Use unique tag with timestamp to ensure each notification appears
  // Windows groups notifications with same tag, so we make it unique
  const chatUid = payload?.data?.chatUid || 'chat';
  const uniqueTag = `${chatUid}-${Date.now()}`;
  
  const notificationOptions = {
    body: notificationBody,
    icon: payload?.data?.icon || payload?.notification?.icon || '/images/icon-192x192.png',
    badge: payload?.data?.badge || '/images/badge-72x72.png',
    tag: uniqueTag,
    data: {
      chatUid: payload?.data?.chatUid,
      type: payload?.data?.type || 'chat_message',
      url: payload?.data?.url || '/chat',
      ...payload?.data
    },
    requireInteraction: true,
    vibrate: [200, 100, 200],
    silent: false,
    renotify: true,
    timestamp: Date.now(),
  };
  
  console.log('[firebase-messaging-sw.js] Showing notification:', { title: notificationTitle, options: notificationOptions });
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);
  
  event.notification.close();
  
  // Always navigate to /chat - the app will handle chat selection internally
  const urlToOpen = '/chat';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          // Focus existing window and navigate to chat
          return client.focus().then(function() {
            if ('navigate' in client) {
              return client.navigate(urlToOpen);
            }
            return client;
          });
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
