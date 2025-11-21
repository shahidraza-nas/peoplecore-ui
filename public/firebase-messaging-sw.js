// [Firebase Messaging Service Worker]
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
// Note: These will be replaced at runtime by the browser's environment
firebase.initializeApp({
  apiKey: "AIzaSyA7-n8AnllA-91Cf7Y5e5aBmaxFtDHaQhQ",
  authDomain: "people-core-53841.firebaseapp.com",
  projectId: "people-core-53841",
  storageBucket: "people-core-53841.appspot.com",
  messagingSenderId: "710003038884",
  appId: "1:710003038884:web:074617809c1bf72962a431",
  measurementId: "G-SHS941HLMN"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload?.notification?.title || payload?.data?.title || 'New Message';
  const notificationBody = payload?.notification?.body || payload?.data?.body || 'You have a new message';
  
  const notificationOptions = {
    body: notificationBody,
    icon: payload?.data?.icon || payload?.notification?.icon || '/images/icon-192x192.png',
    badge: payload?.data?.badge || '/images/badge-72x72.png',
    tag: payload?.data?.chatUid || 'chat-notification',
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
