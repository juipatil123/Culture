import { db } from './firebaseConfig';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export const testFirestoreConnection = async () => {
    console.log('🧪 Starting Firestore Connection Test...');

    // Check for missing environment variables first
    const missingVars = [];
    if (!process.env.REACT_APP_FIREBASE_API_KEY) missingVars.push('API_KEY');
    if (!process.env.REACT_APP_FIREBASE_PROJECT_ID) missingVars.push('PROJECT_ID');

    if (missingVars.length > 0) {
        return {
            success: false,
            message: `Environment variables missing: ${missingVars.join(', ')}. Please create your .env file and restart the server.`
        };
    }

    try {
        // Attempt to list collections or just a single doc from a likely collection
        const testRef = collection(db, 'CULTUREDB');
        const q = query(testRef, limit(1));
        const snapshot = await getDocs(q);

        console.log('✅ Firestore Connection Successful!');
        console.log('📄 Documents found in CULTUREDB:', snapshot.size);
        return {
            success: true,
            message: 'Successfully connected to Firestore!',
            docsFound: snapshot.size
        };
    } catch (error) {
        console.error('❌ Firestore Connection Failed:', error);
        return {
            success: false,
            message: error.message,
            code: error.code
        };
    }
};
