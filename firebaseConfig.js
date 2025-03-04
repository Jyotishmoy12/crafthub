// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'; // Add Firestore import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu0dYOJXyGw-hv1HdJiPvX5oq9of5px44",
  authDomain: "crafthub-c7921.firebaseapp.com",
  projectId: "crafthub-c7921",
  storageBucket: "crafthub-c7921.firebasestorage.app",
  messagingSenderId: "736108120286",
  appId: "1:736108120286:web:d3f9647f121cfdb6349a4f",
  measurementId: "G-1FL5VE94LY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app); // Export Firestore instance