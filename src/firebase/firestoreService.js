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
    setDoc,
    onSnapshot
} from 'firebase/firestore';

/**
 * Firestore Service for CULTUREDB
 * Target Sub-collections based on defined structure
 */

const BASE_COLLECTION = 'CULTUREDB';

const getCollectionRef = (subCollection) => {
    return collection(db, BASE_COLLECTION, subCollection, 'records');
};

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
export const NoticeService = createCrud('NOTICES');

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

export const getNoticesForUser = async (userId, role) => {
    const colRef = collection(db, BASE_COLLECTION, 'NOTICES', 'items');
    // For now, let's just get all and filter in JS to keep it simple, 
    // or we can use multiple queries if needed.
    // Ideally, we want messages where recipientId == userId OR recipientRole == role OR recipientId == 'all'
    const snapshot = await getDocs(colRef);
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(notice =>
            notice.recipientId === userId ||
            notice.recipientRole === role ||
            notice.recipientId === 'all' ||
            notice.senderId === userId
        )
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getAllNotices = async () => {
    const colRef = collection(db, BASE_COLLECTION, 'NOTICES', 'items');
    const snapshot = await getDocs(colRef);
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getAllUsers = async () => {
    const colRef = collection(db, 'users');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToNotices = (userId, role, callback) => {
    const colRef = collection(db, BASE_COLLECTION, 'NOTICES', 'items');

    // We can't easily do (id == userId OR role == role) in a single Firestore query with OR
    // So we'll just listen to all and filter in the callback for now, 
    // or we could set up multiple listeners.
    // For simplicity, let's just listen to the whole collection and filter.
    return onSnapshot(colRef, (snapshot) => {
        const notices = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(notice =>
                notice.recipientId === userId ||
                notice.recipientRole === role ||
                notice.recipientId === 'all' ||
                notice.senderId === userId
            )
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        callback(notices);
    });
};

export const subscribeToAllNotices = (callback) => {
    const colRef = collection(db, BASE_COLLECTION, 'NOTICES', 'items');
    return onSnapshot(colRef, (snapshot) => {
        const notices = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const timeA = a.date ? new Date(a.date).getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
                const timeB = b.date ? new Date(b.date).getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
                return timeB - timeA;
            });
        callback(notices);
    });
};

export const subscribeToProjects = (callback) => {
    const colRef = collection(db, BASE_COLLECTION, 'PROJECTS', 'items');
    return onSnapshot(colRef, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(projects);
    });
};


export const subscribeToAllUsers = (callback) => {
    const colRef = collection(db, 'users');
    return onSnapshot(colRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(users);
    });
};

export const subscribeToTasks = (callback) => {
    const colRef = collection(db, BASE_COLLECTION, 'TASK', 'items');
    return onSnapshot(colRef, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(tasks);
    });
};
