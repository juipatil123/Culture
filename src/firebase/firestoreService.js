import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';

/**
 * Firestore Service for CULTUREDB
 * Target Sub-collections based on defined structure
 */

const BASE_COLLECTION = 'CULTUREDB';


// Generic CRUD factory
const createCrud = (subCollection) => {
    const colRef = collection(db, BASE_COLLECTION, subCollection, 'items');

    return {
        getAll: async () => {
            const snapshot = await getDocs(colRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        getById: async (id) => {
            const docRef = doc(db, BASE_COLLECTION, subCollection, 'items', id);
            const snapshot = await getDoc(docRef);
            return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        },
        create: async (data) => {
            const docRef = await addDoc(colRef, {
                ...data,
                createdAt: serverTimestamp()
            });
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            const docRef = doc(db, BASE_COLLECTION, subCollection, 'items', id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
            return { id, ...data };
        },
        delete: async (id) => {
            const docRef = doc(db, BASE_COLLECTION, subCollection, 'items', id);
            await deleteDoc(docRef);
            return true;
        }
    };
};

// Factory for User collections (sharing the root 'users' node)
const createUserCrud = (allowedRoles) => {
    const colRef = collection(db, 'users');
    // Ensure array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return {
        getAll: async () => {
            const q = query(colRef, where('role', 'in', roles));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        getById: async (id) => {
            const docRef = doc(db, 'users', id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (roles.includes(data.role)) {
                    return { id: snapshot.id, ...data };
                }
            }
            return null;
        },
        create: async (data) => {
            // Note: registerUser is preferred, but this remains for fallback
            const docRef = await addDoc(colRef, {
                ...data,
                createdAt: serverTimestamp()
            });
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            const docRef = doc(db, 'users', id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
            return { id, ...data };
        },
        delete: async (id) => {
            const docRef = doc(db, 'users', id);
            await deleteDoc(docRef);
            return true;
        }
    };
};

// Specialized Services
export const ProjectService = createCrud('PROJECTS');
export const TaskService = createCrud('TASK');

// User Services mapped to unified USERS collection
export const AdminService = createUserCrud(['admin']);
export const PMService = createUserCrud(['project-manager']);
export const TLService = createUserCrud(['team-leader']);
export const MemberService = createUserCrud(['employee', 'intern', 'web-developer']); // inclusive of common employee roles
export const PointsService = createCrud('POINTSSCHEMES');
export const RoleService = createCrud('CUSTOMERROLES');
export const DailyWorkService = createCrud('DAILYWORKS');

// Example of a conditional query
export const getTasksByProject = async (projectId) => {
    const colRef = collection(db, BASE_COLLECTION, 'TASK', 'items');
    const q = query(colRef, where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getMemberByEmail = async (email) => {
    const colRef = collection(db, 'users');
    const q = query(colRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

// Notice Service
export const NoticeService = createCrud('NOTICES');

// Get all users from unified users collection
export const getAllUsers = async () => {
    const colRef = collection(db, 'users');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Subscribe to notices for a specific user
// Subscribe to notices for a specific user
export const subscribeToNotices = (userId, role, callback) => {
    // Handle optional role argument
    let actualCallback = callback;
    if (typeof role === 'function') {
        actualCallback = role;
    }

    if (typeof actualCallback !== 'function') {
        console.error('subscribeToNotices: Callback is not a function', { userId, role, callback });
        return () => { };
    }

    console.log('🔔 Setting up notice subscription for userId:', userId);
    const colRef = collection(db, BASE_COLLECTION, 'NOTICES', 'items');
    const q = query(colRef, where("targetUsers", "array-contains", userId));

    return onSnapshot(q, (snapshot) => {
        const notices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('📨 Firestore query result for userId:', userId, '- Found:', notices.length, 'notices');
        actualCallback(notices);
    }, (error) => {
        console.error('❌ Error in notice subscription:', error);
        actualCallback([]);
    });
};

// Subscribe to notices by email (fallback method)
export const subscribeToNoticesByEmail = (userEmail, callback) => {
    console.log('🔔 Setting up notice subscription for email:', userEmail);
    const colRef = collection(db, BASE_COLLECTION, 'NOTICES', 'items');
    const q = query(colRef, where("targetEmails", "array-contains", userEmail));

    return onSnapshot(q, (snapshot) => {
        const notices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('📨 Firestore query result for email:', userEmail, '- Found:', notices.length, 'notices');
        callback(notices);
    }, (error) => {
        console.error('❌ Error in notice subscription by email:', error);
        callback([]);
    });
};

// Subscribe to all notices (admin view)
export const subscribeToAllNotices = (callback) => {
    if (typeof callback !== 'function') return () => { };
    const colRef = collection(db, BASE_COLLECTION, 'NOTICES', 'items');

    return onSnapshot(colRef, (snapshot) => {
        const notices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notices);
    });
};

// Subscribe to all users
export const subscribeToAllUsers = (callback) => {
    if (typeof callback !== 'function') return () => { };
    const colRef = collection(db, 'users');

    return onSnapshot(colRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(users);
    });
};

// Subscribe to projects
export const subscribeToProjects = (callback) => {
    if (typeof callback !== 'function') return () => { };
    const colRef = collection(db, BASE_COLLECTION, 'PROJECTS', 'items');

    return onSnapshot(colRef, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(projects);
    });
};

// Subscribe to tasks
export const subscribeToTasks = (callback) => {
    if (typeof callback !== 'function') return () => { };
    const colRef = collection(db, BASE_COLLECTION, 'TASK', 'items');

    return onSnapshot(colRef, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(tasks);
    });
};
