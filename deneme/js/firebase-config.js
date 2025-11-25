import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

const userConfig = {
    apiKey: "AIzaSyDUN827ZeD2YhEYAkB5OeWkF6OIiF59bFI",
    authDomain: "learning-eng-cc8e5.firebaseapp.com",
    projectId: "learning-eng-cc8e5",
    storageBucket: "learning-eng-cc8e5.firebasestorage.app",
    messagingSenderId: "443233964962",
    appId: "1:443233964962:web:d7181e4bb4e2377c5898fb",
    measurementId: "G-K60HHNSBQ2"
};

// Use global config if available (for consistency with original app logic)
const firebaseConfig = (typeof window.__firebase_config !== 'undefined') ? JSON.parse(window.__firebase_config) : userConfig;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken, doc, setDoc, getDoc };
