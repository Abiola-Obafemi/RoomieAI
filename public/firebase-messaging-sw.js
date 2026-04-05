// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAeWmI-cauFagG-fpn0c2JqpxyFKHZhZCI",
  authDomain: "roomieai-14fc8.firebaseapp.com",
  databaseURL: "https://roomieai-14fc8-default-rtdb.firebaseio.com",
  projectId: "roomieai-14fc8",
  storageBucket: "roomieai-14fc8.firebasestorage.app",
  messagingSenderId: "150455796253",
  appId: "1:150455796253:web:d42edcf2e19e32ae063cf4"
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// If you want to handle background messages Customly:
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
