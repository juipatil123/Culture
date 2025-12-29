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
    setDoc
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
