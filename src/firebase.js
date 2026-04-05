import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get } from "firebase/database";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAeWmI-cauFagG-fpn0c2JqpxyFKHZhZCI",
  authDomain: "roomieai-14fc8.firebaseapp.com",
  databaseURL: "https://roomieai-14fc8-default-rtdb.firebaseio.com",
  projectId: "roomieai-14fc8",
  storageBucket: "roomieai-14fc8.firebasestorage.app",
  messagingSenderId: "150455796253",
  appId: "1:150455796253:web:d42edcf2e19e32ae063cf4",
  measurementId: "G-30R3C4T9YS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const db = getDatabase(app);

// Initialize Cloud Messaging
const messaging = getMessaging(app);

export { app, db, messaging, ref, onValue, set, update, get, getToken, onMessage };
