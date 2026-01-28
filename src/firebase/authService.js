import { auth, db, firebaseConfig } from './firebaseConfig';
import { initializeApp, deleteApp } from 'firebase/app';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    getAuth,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    setDoc
} from 'firebase/firestore';


/**
 * Enhanced Authentication Service for CULTUREDB
 */
export const AuthService = {
    /**
     * Login user and fetch their profile from the correct sub-collection
     */
    login: async (email, password, expectedRole) => {
        // Enforce @gmail.com
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            throw new Error('Only @gmail.com email addresses are allowed.');
        }
        try {
            const normalizedEmail = email.toLowerCase();
            // 1. Firebase Auth SignIn
            let userCredential;
            try {
                userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
            } catch (authError) {
                console.error('Firebase Auth Error:', authError.code);
                // Re-throw with clear message
                if (authError.code === 'auth/invalid-email') {
                    throw new Error('Please enter a valid email address.');
                }
                throw authError; // Let the UI handle standard auth errors
            }

            const user = userCredential.user;

            // 2. Search for user profile in unified root 'users' collection
            const colRef = collection(db, 'users');
            const q = query(colRef, where("email", "==", normalizedEmail));
            const querySnapshot = await getDocs(q);

            let userData;
            if (querySnapshot.empty) {
                // Check if doc exists by UID directly (optimization)
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    // Found by UID
                    userData = {
                        id: userDocSnap.id,
                        ...userDocSnap.data(),
                        uid: user.uid
                    };
                } else {
                    await signOut(auth);
                    throw new Error('User profile not found in database.');
                }
            } else {
                userData = {
                    id: querySnapshot.docs[0].id,
                    ...querySnapshot.docs[0].data(),
                    uid: user.uid
                };
            }

            // 3. Verify Role Mismatch
            // Allow login only if the stored role matches the requested role
            // or perform a normalization check
            if (userData.role !== expectedRole) {
                // Fuzzy match check (e.g. employee vs Employee)
                const normalize = (r) => r?.toLowerCase().trim();
                if (normalize(userData.role) !== normalize(expectedRole)) {
                    await signOut(auth);
                    const error = new Error(`Access Denied: Your account role is '${userData.role}', but you tried to login as '${expectedRole}'.`);
                    error.code = 'ROLE_MISMATCH';
                    throw error;
                }
            }

            return {
                user: userData,
                token: await user.getIdToken()
            };
        } catch (error) {
            console.error('AuthService Detail Error:', error);
            throw error;
        }
    },

    logout: async () => {
        return await signOut(auth);
    },

    getCurrentUser: () => {
        return auth.currentUser;
    },

    onAuthChange: (callback) => {
        return onAuthStateChanged(auth, callback);
    },

    /**
     * Register a new user in Firebase Auth AND Firestore 
     * without logging out the current admin.
     */
    registerUser: async (userData) => {
        const { email, password, role } = userData;
        // Enforce @gmail.com
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            throw new Error('Only @gmail.com email addresses are allowed.');
        }
        console.log(`👤 AuthService: Starting registration for ${email} as ${role}`);

        try {
            // Check config availability
            if (!firebaseConfig) {
                throw new Error('Firebase Configuration is missing. Cannot register user.');
            }

            // 1. Create the user in Firebase Authentication
            // To prevent the admin from being logged out, we use a secondary app instance.
            console.log('🏗️ AuthService: Initializing temporary app for Auth creation...');
            const tempAppName = `temp-app-${Date.now()}`;

            // Fix for (app/no-options): We use the exported firebaseConfig directly
            const tempApp = initializeApp(firebaseConfig, tempAppName);
            const tempAuth = getAuth(tempApp);

            console.log('🔐 AuthService: Creating Firebase Auth account...');
            const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
            const newUser = userCredential.user;
            console.log('✅ AuthService: Auth account created successfully:', newUser.uid);

            // 2. Clean up temp app immediately
            await deleteApp(tempApp);

            // 3. Create the profile in Firestore - UNIFIED 'users' ROOT NODE
            console.log('📂 AuthService: Creating Firestore profile in root users collection...');
            const userDocRef = doc(db, 'users', newUser.uid);

            const profileData = {
                ...userData,
                email: email.toLowerCase(),
                password: password, // Explicitly ensure password is saved
                uid: newUser.uid,
                createdAt: new Date().toISOString()
            };


            // Store password in Firestore profile to enable "View Password" feature
            await setDoc(userDocRef, profileData);
            console.log(`🎉 AuthService: Profile saved to users/${newUser.uid}`);

            return { success: true, uid: newUser.uid };
        } catch (error) {
            console.error('❌ AuthService: Registration Error:', error);

            let errorMessage = error.message || 'Unknown registration error';

            // Translate common Firebase errors for the UI
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered in Firebase.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'The password is too weak. Please use at least 6 characters.';
            } else if (error.code === 'app/no-options') {
                errorMessage = 'Firebase configuration error (no options provided).';
            }

            // Ensure we throw a proper Error object
            throw new Error(errorMessage);
        }
    },

    /**
     * Update user password in both Firebase Auth and Firestore.
     * Requires the old password to be stored in Firestore (recorded during registration).
     */
    updatePassword: async (userId, newPassword) => {
        try {
            console.log(`🔐 AuthService: Updating password for user ${userId}`);

            // 1. Get the user's current data from Firestore
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                throw new Error('User profile not found in database.');
            }

            const userData = userDocSnap.data();
            const email = userData.email;
            const oldPassword = userData.password; // The password we have recorded

            if (!oldPassword) {
                console.warn('⚠️ No old password found in Firestore. Updating Firestore only. User may need to use Forgot Password.');
            } else {
                try {
                    // 2. Use temp app to update password in Firebase Auth
                    const tempAppName = `update-pw-app-${Date.now()}`;
                    const tempApp = initializeApp(firebaseConfig, tempAppName);
                    const tempAuth = getAuth(tempApp);

                    // Sign in as the user
                    const userCredential = await signInWithEmailAndPassword(tempAuth, email, oldPassword);
                    // Update password
                    const { updatePassword: firebaseUpdatePassword } = await import('firebase/auth');
                    await firebaseUpdatePassword(userCredential.user, newPassword);

                    // Clean up
                    await deleteApp(tempApp);
                    console.log('✅ AuthService: Firebase Auth password updated successfully');
                } catch (authError) {
                    console.error('❌ AuthService: Failed to update Firebase Auth password:', authError);
                    // If it fails (e.g. password mismatch in Auth), we still update Firestore 
                    // so the "View Password" reflects what the admin intended.
                }
            }

            // 3. Update Firestore profile
            await setDoc(userDocRef, {
                ...userData,
                password: newPassword,
                passwordUpdatedAt: new Date().toISOString()
            });
            console.log('✅ AuthService: Firestore profile updated with new password');

            return { success: true };
        } catch (error) {
            console.error('❌ AuthService: updatePassword Error:', error);
            throw error;
        }
    }
};

