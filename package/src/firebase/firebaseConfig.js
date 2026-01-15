import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Hardcoded Firebase configuration based on user-provided keys
export const firebaseConfig = {
    apiKey: "AIzaSyCa-6yCpbW0_pxgX0_QQIbgoYSgMwsNJRU",
    authDomain: "culturedb-fbd70.firebaseapp.com",
    projectId: "culturedb-fbd70",
    storageBucket: "culturedb-fbd70.firebasestorage.app",
    messagingSenderId: "472763215930",
    appId: "1:472763215930:web:07c4dd6becef98f24c4503"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
