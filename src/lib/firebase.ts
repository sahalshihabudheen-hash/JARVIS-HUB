import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: The USER needs to replace these with their actual Firebase project config.
const firebaseConfig = {
  apiKey: "AIzaSyCsYMqssfDKU5OLBIItPBUdxK6xXlVAYlo",
  authDomain: "jarvis-hub-c4c00.firebaseapp.com",
  projectId: "jarvis-hub-c4c00",
  storageBucket: "jarvis-hub-c4c00.firebasestorage.app",
  messagingSenderId: "345270233270",
  appId: "1:345270233270:web:0a1d997966eeb09ac2de17",
  measurementId: "G-FF7PF4QDZ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
